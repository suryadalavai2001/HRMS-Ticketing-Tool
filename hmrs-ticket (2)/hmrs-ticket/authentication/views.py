from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import authenticate
from .serializers import CustomTokenObtainPairSerializer, UserSerializer
from .permissions import HasRequiredPermission
from .models import User, UserAuditLog
from .serializers import UserCreateSerializer, UserUpdateSerializer

class CustomLoginView(TokenObtainPairView):
    """
    🚫 Ticketing does NOT handle login.
    HRMS is the only authentication authority.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        return Response(
            {
                "error": "Login disabled",
                "message": "Use HRMS login. Ticketing trusts JWT only."
            },
            status=status.HTTP_403_FORBIDDEN
        )


class CustomRefreshView(TokenRefreshView):
    """
    Custom refresh view that maintains the same response format.
    Inherits refresh token rotation and blacklisting from settings.
    """
    
    def post(self, request, *args, **kwargs):
        """
        Handle token refresh request.
        """
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                return Response(
                    {
                        'message': 'Token refreshed successfully',
                        'access': response.data['access'],
                        'refresh': response.data.get('refresh')  # May be new token due to rotation
                    },
                    status=status.HTTP_200_OK
                )
            return response
        except Exception as e:
            return Response(
                {
                    'error': 'Token refresh failed',
                    'message': str(e)
                },
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """
    Logout view that blacklists the refresh token.
    This ensures the token cannot be used again.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Handle logout request by blacklisting the refresh token.
        """
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {
                        'error': 'Refresh token required',
                        'message': 'Please provide refresh token to logout'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {
                    'message': 'Logout successful',
                    'detail': 'Refresh token has been blacklisted'
                },
                status=status.HTTP_200_OK
            )
            
        except TokenError as e:
            return Response(
                {
                    'error': 'Invalid token',
                    'message': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Logout failed',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(APIView):
    """
    View to get current user's profile information.
    Demonstrates usage of custom permission class.
    """
    permission_classes = [HasRequiredPermission]
    permission_required = 'can_view_profile'  # Required permission
    
    def get(self, request):
        """
        Get current user's profile with permissions.
        """
        serializer = UserSerializer(request.user)
        return Response(
            {
                'message': 'Profile retrieved successfully',
                'user': serializer.data
            },
            status=status.HTTP_200_OK
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_test_view(request):
    """
    Simple test view to verify JWT authentication is working.
    """
    return Response(
        {
            'message': 'Authentication successful',
            'user': request.user.username,
            'user_id': request.user.id
        },
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_test_view(request):
    """
    Test view that requires specific permission.
    Demonstrates custom permission class usage.
    """
    # Check permission manually since we can't use class-based permission with function views easily
    from .permissions import HasRequiredPermission
    
    permission_checker = HasRequiredPermission('can_manage_users')
    if not permission_checker.has_permission(request, None):
        return Response(
            {'error': 'Permission denied', 'required_permission': 'can_manage_users'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    return Response(
        {
            'message': 'Admin access granted',
            'user': request.user.username,
            'required_permission': 'can_manage_users'
        },
        status=status.HTTP_200_OK
    )

class CreateUserAPIView(APIView):
    """
    HRMS-only API to create users.
    Ticketing must NEVER create users.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            UserAuditLog.objects.create(
                user=user,
                action='CREATE',
                performed_by=request.user,
                details=request.data
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class UpdateUserAPIView(APIView):
    """
    HRMS API to update user details.
    """
    permission_classes = [IsAuthenticated]

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserUpdateSerializer(
            user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            UserAuditLog.objects.create(
                user=user,
                action='UPDATE',
                performed_by=request.user,
                details=request.data
            )

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class DisableUserAPIView(APIView):
    """
    Soft-disable a user (prevents login).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        user.is_active = False
        user.save()

        UserAuditLog.objects.create(
            user=user,
            action='DISABLE',
            performed_by=request.user
        )

        return Response(
            {"message": "User disabled successfully"},
            status=status.HTTP_200_OK
        )
