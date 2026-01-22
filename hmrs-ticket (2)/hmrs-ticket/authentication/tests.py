from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
from django.conf import settings
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
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertTrue(self.user.check_password('testpass123'))

    def test_permission_creation(self):
        self.assertEqual(self.permission.name, 'test_permission')
        self.assertEqual(str(self.permission), 'test_permission')

    def test_user_permission_assignment(self):
        user_perm = UserPermission.objects.create(
            user=self.user,
            permission=self.permission,
            granted_by=self.user
        )
        self.assertEqual(user_perm.user, self.user)
        self.assertEqual(user_perm.permission, self.permission)


class JWTAuthenticationTests(APITestCase):
    """
    JWT validation tests for login-disabled architecture.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

        self.permission1 = Permission.objects.create(name='can_view_tickets')
        self.permission2 = Permission.objects.create(name='can_create_tickets')

        UserPermission.objects.create(user=self.user, permission=self.permission1)
        UserPermission.objects.create(user=self.user, permission=self.permission2)

    def _generate_token(self, permissions):
        refresh = RefreshToken.for_user(self.user)
        access = refresh.access_token

        access['iss'] = settings.SIMPLE_JWT['ISSUER']
        access['aud'] = [settings.SIMPLE_JWT['AUDIENCE']]
        access['permissions'] = permissions

        return str(access)

    def test_jwt_contains_required_claims(self):
        token = self._generate_token(['can_view_tickets'])

        decoded = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=['HS256'],
            options={"verify_aud": False}
        )

        self.assertEqual(decoded['iss'], settings.SIMPLE_JWT['ISSUER'])
        self.assertIn(settings.SIMPLE_JWT['AUDIENCE'], decoded['aud'])
        self.assertIn('permissions', decoded)
        self.assertIn('can_view_tickets', decoded['permissions'])

    def test_login_endpoint_is_disabled(self):
        login_url = reverse('login')
        response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)



class PermissionTests(APITestCase):
    """
    Permission enforcement tests.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username='adminuser',
            email='admin@example.com',
            password='password'
        )

        self.user_no_perm = User.objects.create_user(
            username='nopermuser',
            email='noperm@example.com',
            password='password'
        )

        self.permission = Permission.objects.create(name='can_manage_users')
        self.test_url = reverse('admin_test')

    def _get_token(self, user, permissions):
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        access['iss'] = settings.SIMPLE_JWT['ISSUER']
        access['aud'] = [settings.SIMPLE_JWT['AUDIENCE']]
        access['permissions'] = permissions

        return str(access)

    def test_permission_required_success(self):
        UserPermission.objects.create(
            user=self.user,
            permission=self.permission
        )

        token = self._get_token(self.user, ['can_manage_users'])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(self.test_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_permission_required_denied(self):
        token = self._get_token(self.user_no_perm, [])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(self.test_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_access_denied(self):
        response = self.client.get(self.test_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_disabled_user_access_revoked(self):
        self.user.is_active = False
        self.user.save()

        token = self._get_token(self.user, ['can_manage_users'])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(self.test_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
