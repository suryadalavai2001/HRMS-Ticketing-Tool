# HRMS & Ticketing System - Authentication & JWT Core

A Django-based authentication system with JWT tokens for a unified HRMS and Ticketing platform. This system provides stateless authentication with granular permission-based access control.

## Features

- **JWT Authentication**: Stateless authentication using JSON Web Tokens
- **Custom Permission System**: Granular permissions stored as flat arrays in JWT tokens
- **Token Management**: 30-minute access tokens, 7-day refresh tokens with rotation
- **Security Features**: Token blacklisting, refresh token rotation
- **Custom User Model**: Extended user model for HRMS integration
- **Permission-Based Access Control**: Custom DRF permission classes

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd hrms-ticketing-auth

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create initial permissions
python manage.py setup_permissions

# Create sample users (optional)
python manage.py create_sample_data

# Create superuser
python manage.py createsuperuser
```

### 3. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/auth/`

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
    "username": "your_username",
    "password": "your_password"
}
```

**Response:**
```json
{
    "message": "Login successful",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@company.com",
        "first_name": "System",
        "last_name": "Administrator"
    }
}
```

#### Refresh Token
```http
POST /api/auth/refresh/
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
    "message": "Token refreshed successfully",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Logout
```http
POST /api/auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
    "message": "Logout successful",
    "detail": "Refresh token has been blacklisted"
}
```

### User Profile

#### Get Profile
```http
GET /api/auth/profile/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
    "message": "Profile retrieved successfully",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@company.com",
        "first_name": "System",
        "last_name": "Administrator",
        "employee_id": "EMP001",
        "department": "IT",
        "position": "System Administrator",
        "is_active": true,
        "date_joined": "2024-01-01T00:00:00Z",
        "permissions": [
            "can_view_users",
            "can_manage_users",
            "can_view_tickets",
            "can_manage_tickets"
        ]
    }
}
```

### Test Endpoints

#### Protected Test
```http
GET /api/auth/test/
Authorization: Bearer <access_token>
```

#### Admin Test (Requires 'can_manage_users' permission)
```http
GET /api/auth/admin-test/
Authorization: Bearer <access_token>
```

## JWT Token Structure

The JWT tokens contain the following claims:

```json
{
    "token_type": "access",
    "exp": 1640995200,
    "iat": 1640993400,
    "jti": "abc123...",
    "sub": 1,
    "username": "admin",
    "email": "admin@company.com",
    "permissions": [
        "can_view_users",
        "can_manage_users",
        "can_view_tickets",
        "can_create_tickets"
    ]
}
```

**Key Claims:**
- `sub`: User ID (as required)
- `permissions`: Flat array of permission strings (as required)
- No role-based claims (Admin/User strings are not used)

## Permission System

### Built-in Permissions

The system comes with predefined permissions organized by category:

**User Management:**
- `can_view_users`
- `can_create_users`
- `can_edit_users`
- `can_delete_users`
- `can_manage_users`

**HRMS Permissions:**
- `can_view_employees`
- `can_manage_employees`
- `can_view_departments`
- `can_manage_departments`
- `can_view_payroll`
- `can_manage_payroll`

**Ticketing Permissions:**
- `can_view_tickets`
- `can_create_tickets`
- `can_edit_tickets`
- `can_delete_tickets`
- `can_assign_tickets`
- `can_manage_tickets`

### Custom Permission Classes

#### HasRequiredPermission
Checks for a specific permission in the JWT token.

```python
from authentication.permissions import HasRequiredPermission

class MyView(APIView):
    permission_classes = [HasRequiredPermission]
    permission_required = 'can_view_tickets'
```

#### HasAnyPermission
Checks if user has ANY of the specified permissions.

```python
from authentication.permissions import HasAnyPermission

class MyView(APIView):
    permission_classes = [HasAnyPermission(['can_view_tickets', 'can_manage_tickets'])]
```

#### HasAllPermissions
Checks if user has ALL of the specified permissions.

```python
from authentication.permissions import HasAllPermissions

class MyView(APIView):
    permission_classes = [HasAllPermissions(['can_view_users', 'can_edit_users'])]
```

## Sample Users

After running `python manage.py create_sample_data`, you'll have:

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| admin | admin123 | System Admin | All permissions |
| hr_manager | hr123 | HR Manager | HR and user management |
| employee | emp123 | Employee | Basic profile and ticket access |

## Configuration

### Token Lifetimes
- **Access Token**: 30 minutes
- **Refresh Token**: 7 days

### Security Features
- **Refresh Token Rotation**: Enabled
- **Token Blacklisting**: Enabled on logout
- **Algorithm**: HS256

### Settings Configuration

Key settings in `settings.py`:

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'USER_ID_CLAIM': 'sub',
    'TOKEN_OBTAIN_SERIALIZER': 'authentication.serializers.CustomTokenObtainPairSerializer',
}
```

## Testing

Run the test suite:

```bash
python manage.py test authentication
```

The tests cover:
- User and permission model functionality
- JWT token generation and validation
- Permission-based access control
- Token refresh and blacklisting
- Custom permission classes

## Security Considerations

1. **Token Storage**: Store JWT tokens securely on the client side
2. **HTTPS**: Always use HTTPS in production
3. **Secret Key**: Use a strong, unique SECRET_KEY in production
4. **Token Expiration**: Short-lived access tokens minimize security risks
5. **Permission Validation**: Permissions are validated on every request
6. **Token Blacklisting**: Logout immediately invalidates refresh tokens

## Integration with Other Systems

This authentication system is designed to be the single source of truth for:
- User management
- Permission assignment
- Authentication state

Other systems (like the ticketing tool) should:
1. Validate JWT tokens using the same SECRET_KEY
2. Extract permissions from the token's `permissions` array
3. Use the `sub` claim for user identification

## Admin Interface

Access the Django admin at `/admin/` to:
- Manage users and their information
- Create and assign permissions
- View user-permission relationships
- Monitor system activity

## Management Commands

### Setup Permissions
```bash
python manage.py setup_permissions
```
Creates all predefined permissions in the system.

### Create Sample Data
```bash
python manage.py create_sample_data
```
Creates sample users with different permission levels for testing.

## API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
    "message": "Operation successful",
    "data": { ... }
}
```

**Error Response:**
```json
{
    "error": "Error type",
    "message": "Detailed error message"
}
```

## Next Steps

1. **Integration**: Integrate with your ticketing system
2. **Frontend**: Build frontend authentication flows
3. **Monitoring**: Add logging and monitoring
4. **Scaling**: Consider Redis for token blacklisting in production
5. **Additional Features**: Add password reset, email verification, etc.

## Support

For questions or issues, please refer to the Django and DRF documentation:
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)