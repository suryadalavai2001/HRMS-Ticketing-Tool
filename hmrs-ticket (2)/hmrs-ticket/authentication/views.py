from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, UserCreateSerializer, UserUpdateSerializer
from .permissions import HasRequiredPermission
from .models import User, UserAuditLog

# ✅ FIX: Login is ENABLED (Removed the 403 Forbidden block)
class CustomLoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

class CustomRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                return Response({
                    'message': 'Token refreshed successfully',
                    'access': response.data['access'],
                    'refresh': response.data.get('refresh')
                }, status=status.HTTP_200_OK)
            return response
        except Exception:
            return Response({'error': 'Token refresh failed'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [HasRequiredPermission]
    permission_required = 'can_view_profile'
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'message': 'Profile retrieved successfully', 'user': serializer.data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_test_view(request):
    return Response({'message': 'Authentication successful', 'user': request.user.username})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_test_view(request):
    from .permissions import HasRequiredPermission
    permission_checker = HasRequiredPermission('can_manage_users')
    if not permission_checker.has_permission(request, None):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    return Response({'message': 'Admin access granted'})

class CreateUserAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            UserAuditLog.objects.create(user=user, action='CREATE', performed_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateUserAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                UserAuditLog.objects.create(user=user, action='UPDATE', performed_by=request.user)
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, user_id):
        return self.put(request, user_id)

class DisableUserAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.is_active = False
            user.save()
            UserAuditLog.objects.create(user=user, action='DISABLE', performed_by=request.user)
            return Response({"message": "User disabled"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)