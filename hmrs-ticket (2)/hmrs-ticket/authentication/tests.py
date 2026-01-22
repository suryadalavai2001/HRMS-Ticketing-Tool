from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import json
from .models import Permission, UserPermission

User = get_user_model()


class AuthenticationModelTests(TestCase):
    """
    Test cases for authentication models.
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.permission = Permission.objects.create(
            name='test_permission',
            description='Test permission'
        )
    
    def test_user_creation(self):
        """Test user model creation."""
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertTrue(self.user.check_password('testpass123'))
    
    def test_permission_creation(self):
        """Test permission model creation."""
        self.assertEqual(self.permission.name, 'test_permission')
        self.assertEqual(str(self.permission), 'test_permission')
    
    def test_user_permission_assignment(self):
        """Test user permission assignment."""
        user_perm = UserPermission.objects.create(
            user=self.user,
            permission=self.permission,
            granted_by=self.user
        )
        self.assertEqual(user_perm.user, self.user)
        self.assertEqual(user_perm.permission, self.permission)


class JWTAuthenticationTests(APITestCase):
    """
    Test cases for JWT authentication functionality.
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.permission1 = Permission.objects.create(
            name='can_view_tickets',
            description='Can view tickets'
        )
        self.permission2 = Permission.objects.create(
            name='can_create_tickets',
            description='Can create tickets'
        )
        
        # Assign permissions to user
        UserPermission.objects.create(
            user=self.user,
            permission=self.permission1
        )
        UserPermission.objects.create(
            user=self.user,
            permission=self.permission2
        )
        
        self.login_url = reverse('login')
        self.refresh_url = reverse('token_refresh')
        self.logout_url = reverse('logout')
    
    def test_login_success(self):
        """Test successful login with valid credentials."""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        
        # Verify user data
        user_data = response.data['user']
        self.assertEqual(user_data['username'], 'testuser')
        self.assertEqual(user_data['email'], 'test@example.com')
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
    
    def test_jwt_token_contains_permissions(self):
        """Test that JWT token contains user permissions."""
        # Login to get token
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data)
        access_token = response.data['access']
        
        # Decode token to check permissions
        from rest_framework_simplejwt.tokens import UntypedToken
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        from django.conf import settings
        import jwt
        
        try:
            decoded_token = jwt.decode(
                access_token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            
            # Check if permissions are in token
            self.assertIn('permissions', decoded_token)
            permissions = decoded_token['permissions']
            self.assertIn('can_view_tickets', permissions)
            self.assertIn('can_create_tickets', permissions)
            
            # Check user ID is in 'sub' claim (should be string as per JWT spec)
            self.assertIn('sub', decoded_token)
            self.assertEqual(decoded_token['sub'], str(self.user.id))
            
        except (InvalidToken, TokenError) as e:
            self.fail(f"Token decoding failed: {e}")
    
    def test_token_refresh(self):
        """Test token refresh functionality."""
        # Login to get tokens
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        login_response = self.client.post(self.login_url, data)
        refresh_token = login_response.data['refresh']
        
        # Refresh token
        refresh_data = {'refresh': refresh_token}
        response = self.client.post(self.refresh_url, refresh_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_logout_blacklists_token(self):
        """Test that logout blacklists the refresh token."""
        # Login to get tokens
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        login_response = self.client.post(self.login_url, data)
        refresh_token = login_response.data['refresh']
        access_token = login_response.data['access']
        
        # Set authorization header
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Logout
        logout_data = {'refresh': refresh_token}
        response = self.client.post(self.logout_url, logout_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Try to use the refresh token again (should fail)
        refresh_data = {'refresh': refresh_token}
        refresh_response = self.client.post(self.refresh_url, refresh_data)
        
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)


class PermissionTests(APITestCase):
    """
    Test cases for custom permission classes.
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.permission = Permission.objects.create(
            name='can_manage_users',
            description='Can manage users'
        )
        
        # Create user without the required permission
        self.user_no_perm = User.objects.create_user(
            username='nopermuser',
            email='noperm@example.com',
            password='testpass123'
        )
        
        self.test_url = reverse('admin_test')
        self.login_url = reverse('login')
    
    def test_permission_required_success(self):
        """Test access with required permission."""
        # Assign permission to user
        UserPermission.objects.create(
            user=self.user,
            permission=self.permission
        )
        
        # Login and get token
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        login_response = self.client.post(self.login_url, login_data)
        access_token = login_response.data['access']
        
        # Access protected endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.test_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Admin access granted', response.data['message'])
    
    def test_permission_required_denied(self):
        """Test access denied without required permission."""
        # Login user without permission
        login_data = {
            'username': 'nopermuser',
            'password': 'testpass123'
        }
        login_response = self.client.post(self.login_url, login_data)
        access_token = login_response.data['access']
        
        # Try to access protected endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.test_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_access_denied(self):
        """Test that unauthenticated users are denied access."""
        response = self.client.get(self.test_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)