from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser


class HasRequiredPermission(BasePermission):
    """
    Custom DRF Permission class that checks if a specific permission string
    exists in the JWT token's 'permissions' array.
    
    Usage:
    - Set permission_required as a class attribute on your view
    - Or pass it as an argument when instantiating the permission
    
    Example:
        class MyView(APIView):
            permission_classes = [HasRequiredPermission]
            permission_required = 'can_view_tickets'
    
    Or:
        permission_classes = [HasRequiredPermission('can_create_user')]
    """
    
    def __init__(self, required_permission=None):
        """
        Initialize with optional required permission.
        If not provided, will look for permission_required on the view.
        """
        self.required_permission = required_permission
    
    def has_permission(self, request, view):
        """
        Check if the user has the required permission in their JWT token.
        """
        # Check if user is authenticated
        if not request.user or isinstance(request.user, AnonymousUser):
            return False
        
        # Get the required permission
        required_permission = self.required_permission
        if not required_permission:
            required_permission = getattr(view, 'permission_required', None)
        
        if not required_permission:
            # If no specific permission is required, just check if user is authenticated
            return True
        
        # Extract JWT token from request
        jwt_auth = JWTAuthentication()
        try:
            # Get the raw token from the request
            raw_token = jwt_auth.get_raw_token(jwt_auth.get_header(request))
            if raw_token is None:
                return False
            
            # Validate and decode the token
            validated_token = jwt_auth.get_validated_token(raw_token)
            
            # Get permissions from token payload
            token_permissions = validated_token.get('permissions', [])
            
            # Check if required permission exists in token
            return required_permission in token_permissions
            
        except (InvalidToken, TokenError):
            return False
    
    def has_object_permission(self, request, view, obj):
        """
        Object-level permission check.
        By default, delegates to has_permission.
        Override in subclasses for object-specific logic.
        """
        return self.has_permission(request, view)


class HasAnyPermission(BasePermission):
    """
    Permission class that checks if user has ANY of the specified permissions.
    
    Usage:
        permission_classes = [HasAnyPermission(['can_view_tickets', 'can_manage_tickets'])]
    """
    
    def __init__(self, required_permissions=None):
        """
        Initialize with list of permissions (user needs ANY one of them).
        """
        self.required_permissions = required_permissions or []
    
    def has_permission(self, request, view):
        """
        Check if user has any of the required permissions.
        """
        if not request.user or isinstance(request.user, AnonymousUser):
            return False
        
        # Get required permissions
        required_permissions = self.required_permissions
        if not required_permissions:
            required_permissions = getattr(view, 'required_permissions', [])
        
        if not required_permissions:
            return True
        
        # Extract JWT token and check permissions
        jwt_auth = JWTAuthentication()
        try:
            raw_token = jwt_auth.get_raw_token(jwt_auth.get_header(request))
            if raw_token is None:
                return False
            
            validated_token = jwt_auth.get_validated_token(raw_token)
            token_permissions = validated_token.get('permissions', [])
            
            # Check if user has any of the required permissions
            return any(perm in token_permissions for perm in required_permissions)
            
        except (InvalidToken, TokenError):
            return False


class HasAllPermissions(BasePermission):
    """
    Permission class that checks if user has ALL of the specified permissions.
    
    Usage:
        permission_classes = [HasAllPermissions(['can_view_users', 'can_edit_users'])]
    """
    
    def __init__(self, required_permissions=None):
        """
        Initialize with list of permissions (user needs ALL of them).
        """
        self.required_permissions = required_permissions or []
    
    def has_permission(self, request, view):
        """
        Check if user has all of the required permissions.
        """
        if not request.user or isinstance(request.user, AnonymousUser):
            return False
        
        # Get required permissions
        required_permissions = self.required_permissions
        if not required_permissions:
            required_permissions = getattr(view, 'required_permissions', [])
        
        if not required_permissions:
            return True
        
        # Extract JWT token and check permissions
        jwt_auth = JWTAuthentication()
        try:
            raw_token = jwt_auth.get_raw_token(jwt_auth.get_header(request))
            if raw_token is None:
                return False
            
            validated_token = jwt_auth.get_validated_token(raw_token)
            token_permissions = validated_token.get('permissions', [])
            
            # Check if user has all required permissions
            return all(perm in token_permissions for perm in required_permissions)
            
        except (InvalidToken, TokenError):
            return False