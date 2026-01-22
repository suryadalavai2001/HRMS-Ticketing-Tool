# 🔑 Integration Tokens & Credentials for Team

## 📋 **Sample User Accounts**

### **Admin User (Full Access)**
```
Username: admin
Password: admin123
Permissions: All 29 permissions (full system access)
Department: IT
Position: System Administrator
Email: admin@company.com
```

### **HR Manager (HR Access)**
```
Username: hr_manager
Password: hr123
Permissions: 11 HR-related permissions
Department: Human Resources
Position: HR Manager
Email: hr.manager@company.com
```

### **Employee (Basic Access)**
```
Username: employee
Password: emp123
Permissions: 6 basic permissions
Department: Sales
Position: Sales Representative
Email: john.doe@company.com
```

## 🎯 **Sample JWT Tokens**

### **Admin Token (Valid for 30 minutes)**
To get a fresh admin token, use:
```bash
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123"
}
```

**Sample Response:**
```json
{
    "message": "Login successful",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY4OTg2NjMxLCJpYXQiOjE3Njg5ODQ4MzEsImp0aSI6IjExNjFkYTA1YTY1YjQ0OTE5Yzc3Zjc0MjE3NWJmNTdhIiwic3ViIjoiMSIsInBlcm1pc3Npb25zIjpbImNhbl9hc3NpZ25fcGVybWlzc2lvbnMiLCJjYW5fYXNzaWduX3RpY2tldHMiLCJjYW5fYmFja3VwX3N5c3RlbSIsImNhbl9jcmVhdGVfdGlja2V0cyIsImNhbl9jcmVhdGVfdXNlcnMiLCJjYW5fZGVsZXRlX3RpY2tldHMiLCJjYW5fZGVsZXRlX3VzZXJzIiwiY2FuX2VkaXRfcHJvZmlsZSIsImNhbl9lZGl0X3RpY2tldHMiLCJjYW5fZWRpdF91c2VycyIsImNhbl9tYW5hZ2VfYXR0ZW5kYW5jZSIsImNhbl9tYW5hZ2VfZGVwYXJ0bWVudHMiLCJjYW5fbWFuYWdlX2VtcGxveWVlcyIsImNhbl9tYW5hZ2VfaW50ZWdyYXRpb25zIiwiY2FuX21hbmFnZV9wYXlyb2xsIiwiY2FuX21hbmFnZV9wZXJtaXNzaW9ucyIsImNhbl9tYW5hZ2Vfc3lzdGVtX3NldHRpbmdzIiwiY2FuX21hbmFnZV90aWNrZXRzIiwiY2FuX21hbmFnZV91c2VycyIsImNhbl92aWV3X2FsbF90aWNrZXRzIiwiY2FuX3ZpZXdfYXR0ZW5kYW5jZSIsImNhbl92aWV3X2RlcGFydG1lbnRzIiwiY2FuX3ZpZXdfZW1wbG95ZWVzIiwiY2FuX3ZpZXdfcGF5cm9sbCIsImNhbl92aWV3X3Blcm1pc3Npb25zIiwiY2FuX3ZpZXdfcHJvZmlsZSIsImNhbl92aWV3X3N5c3RlbV9sb2dzIiwiY2FuX3ZpZXdfdGlja2V0cyIsImNhbl92aWV3X3VzZXJzIl0sInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGNvbXBhbnkuY29tIn0.omBxOUNfiSrna8PFuVvf0CZjOydDxpi1NSh_hV3AVM",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@company.com",
        "first_name": "System",
        "last_name": "Administrator"
    }
}
```

## 🔐 **JWT Token Structure**

### **Decoded Token Payload:**
```json
{
    "token_type": "access",
    "exp": 1768986631,
    "iat": 1768984831,
    "jti": "unique-token-id",
    "sub": "1",
    "permissions": [
        "can_view_users",
        "can_manage_users",
        "can_view_tickets",
        "can_create_tickets",
        "can_edit_tickets",
        "can_delete_tickets",
        "can_assign_tickets",
        "can_manage_tickets",
        "can_view_all_tickets",
        "can_view_employees",
        "can_manage_employees",
        "can_view_departments",
        "can_manage_departments",
        "can_view_payroll",
        "can_manage_payroll",
        "can_view_attendance",
        "can_manage_attendance",
        "can_view_profile",
        "can_edit_profile",
        "can_view_permissions",
        "can_assign_permissions",
        "can_manage_permissions",
        "can_view_system_logs",
        "can_manage_system_settings",
        "can_backup_system",
        "can_manage_integrations"
    ],
    "username": "admin",
    "email": "admin@company.com"
}
```

## 🌐 **API Endpoints**

### **Base URL:** `http://localhost:8000`

### **Authentication Endpoints:**
```
POST /api/auth/login/          - Login and get tokens
POST /api/auth/refresh/        - Refresh access token
POST /api/auth/logout/         - Logout and blacklist token
```

### **Protected Endpoints:**
```
GET  /api/auth/test/           - Basic auth test
GET  /api/auth/admin-test/     - Requires 'can_manage_users'
GET  /api/auth/profile/        - Requires 'can_view_profile'
```

### **Monitoring Endpoints:**
```
GET  /api/auth/stats/          - System statistics
GET  /api/auth/who-is-online/  - Recent active users
```

### **Admin Interface:**
```
GET  /admin/                   - Django admin panel
```

## 🔑 **System Configuration**

### **JWT Settings:**
```python
ACCESS_TOKEN_LIFETIME = 30 minutes
REFRESH_TOKEN_LIFETIME = 7 days
ALGORITHM = HS256
USER_ID_CLAIM = 'sub'
ROTATE_REFRESH_TOKENS = True
BLACKLIST_AFTER_ROTATION = True
```

### **Secret Key (for token validation):**
```python
SECRET_KEY = 'django-insecure-change-me-in-production'
```
⚠️ **Note:** In production, use a secure secret key!

## 📝 **Permission List (29 Total)**

### **User Management:**
- `can_view_users`
- `can_create_users`
- `can_edit_users`
- `can_delete_users`
- `can_manage_users`

### **Profile Management:**
- `can_view_profile`
- `can_edit_profile`

### **Permission Management:**
- `can_view_permissions`
- `can_assign_permissions`
- `can_manage_permissions`

### **HRMS Permissions:**
- `can_view_employees`
- `can_manage_employees`
- `can_view_departments`
- `can_manage_departments`
- `can_view_payroll`
- `can_manage_payroll`
- `can_view_attendance`
- `can_manage_attendance`

### **Ticketing System Permissions:**
- `can_view_tickets`
- `can_create_tickets`
- `can_edit_tickets`
- `can_delete_tickets`
- `can_assign_tickets`
- `can_manage_tickets`
- `can_view_all_tickets`

### **System Administration:**
- `can_view_system_logs`
- `can_manage_system_settings`
- `can_backup_system`
- `can_manage_integrations`

## 🧪 **Quick Test Commands**

### **PowerShell/Windows:**
```powershell
# Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -Body (@{username="admin"; password="admin123"} | ConvertTo-Json) -ContentType "application/json"

# Get token
$token = $loginResponse.access

# Use token for protected endpoint
$headers = @{Authorization = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/test/" -Method GET -Headers $headers
```

### **cURL/Linux/Mac:**
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Use token (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/auth/test/ \
  -H "Authorization: Bearer TOKEN"
```

### **JavaScript/Fetch:**
```javascript
// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
    })
});

const loginData = await loginResponse.json();
const token = loginData.access;

// Use token
const protectedResponse = await fetch('http://localhost:8000/api/auth/test/', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

## 🔧 **Integration Guidelines**

### **For Other Systems:**
1. **Validate JWT tokens** using the same SECRET_KEY
2. **Extract permissions** from the `permissions` array in token
3. **Use `sub` claim** for user identification
4. **Check token expiration** (exp claim)
5. **Handle token refresh** when access token expires

### **Token Validation Example (Python):**
```python
import jwt
from django.conf import settings

def validate_token(token):
    try:
        decoded = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=['HS256']
        )
        return {
            'valid': True,
            'user_id': decoded.get('sub'),
            'permissions': decoded.get('permissions', []),
            'username': decoded.get('username'),
            'email': decoded.get('email')
        }
    except jwt.ExpiredSignatureError:
        return {'valid': False, 'error': 'Token expired'}
    except jwt.InvalidTokenError:
        return {'valid': False, 'error': 'Invalid token'}
```

## 📊 **User Permission Matrix**

| User | Total Permissions | Key Permissions |
|------|------------------|-----------------|
| **admin** | 29 | All permissions (full access) |
| **hr_manager** | 11 | HR management, user creation, attendance |
| **employee** | 6 | Basic profile, tickets, attendance view |

## 🚀 **Getting Started Checklist**

- [ ] Server running on `http://localhost:8000`
- [ ] Test login with admin credentials
- [ ] Verify JWT token structure
- [ ] Test protected endpoints
- [ ] Check permission validation
- [ ] Test token refresh
- [ ] Test logout/blacklisting

## 📞 **Support**

If your teammate needs help:
1. Check server logs for detailed request/response info
2. Use `/api/auth/stats/` endpoint for system status
3. Verify token structure using JWT decoder tools
4. Test with provided sample credentials first

---

**🎯 Ready for Integration!** All tokens, credentials, and endpoints are documented above.