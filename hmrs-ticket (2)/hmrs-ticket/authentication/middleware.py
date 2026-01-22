import logging
import json
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

# Configure logger
logger = logging.getLogger('api_access')

class APIAccessLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log detailed information about API access including:
    - Who is accessing (user info)
    - What endpoint they're accessing
    - What permissions they have
    - Response status
    """
    
    def process_request(self, request):
        """Log incoming requests with user information."""
        
        # Skip non-API requests and static files
        if not request.path.startswith('/api/') or request.path.startswith('/static/'):
            return None
        
        # Get user information
        user_info = self.get_user_info(request)
        
        # Log the request
        logger.info(f"API REQUEST: {request.method} {request.path}")
        logger.info(f"  User: {user_info['username']} (ID: {user_info['user_id']})")
        logger.info(f"  Email: {user_info['email']}")
        logger.info(f"  Permissions: {len(user_info['permissions'])} permissions")
        logger.info(f"  IP Address: {self.get_client_ip(request)}")
        logger.info(f"  User Agent: {request.META.get('HTTP_USER_AGENT', 'Unknown')[:100]}")
        
        if user_info['permissions']:
            logger.info(f"  User Permissions: {', '.join(user_info['permissions'][:5])}{'...' if len(user_info['permissions']) > 5 else ''}")
        
        return None
    
    def process_response(self, request, response):
        """Log response information."""
        
        # Skip non-API requests
        if not request.path.startswith('/api/'):
            return response
        
        # Get user info again for response logging
        user_info = self.get_user_info(request)
        
        # Log the response
        status_emoji = "✅" if 200 <= response.status_code < 300 else "❌" if response.status_code >= 400 else "⚠️"
        logger.info(f"API RESPONSE: {status_emoji} {response.status_code} for {request.method} {request.path}")
        logger.info(f"  User: {user_info['username']} | Response Size: {len(response.content)} bytes")
        
        # Log response content for errors (be careful with sensitive data)
        if response.status_code >= 400 and hasattr(response, 'content'):
            try:
                content = response.content.decode('utf-8')[:200]
                logger.warning(f"  Error Response: {content}...")
            except:
                logger.warning(f"  Error Response: [Binary content]")
        
        logger.info("-" * 80)
        
        return response
    
    def get_user_info(self, request):
        """Extract detailed user information from request."""
        
        user_info = {
            'username': 'Anonymous',
            'user_id': None,
            'email': 'N/A',
            'permissions': []
        }
        
        # Check if user is authenticated via session
        if hasattr(request, 'user') and not isinstance(request.user, AnonymousUser):
            user_info.update({
                'username': request.user.username,
                'user_id': request.user.id,
                'email': getattr(request.user, 'email', 'N/A'),
            })
            
            # Get permissions from database
            try:
                from authentication.models import UserPermission
                permissions = list(UserPermission.objects.filter(
                    user=request.user
                ).values_list('permission__name', flat=True))
                user_info['permissions'] = permissions
            except:
                pass
        
        # Try to get user info from JWT token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            try:
                jwt_auth = JWTAuthentication()
                raw_token = jwt_auth.get_raw_token(auth_header.encode())
                if raw_token:
                    validated_token = jwt_auth.get_validated_token(raw_token)
                    user_info.update({
                        'username': validated_token.get('username', 'JWT User'),
                        'user_id': validated_token.get('sub', 'Unknown'),
                        'email': validated_token.get('email', 'N/A'),
                        'permissions': validated_token.get('permissions', [])
                    })
            except (InvalidToken, TokenError):
                pass
        
        return user_info
    
    def get_client_ip(self, request):
        """Get the client's IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip