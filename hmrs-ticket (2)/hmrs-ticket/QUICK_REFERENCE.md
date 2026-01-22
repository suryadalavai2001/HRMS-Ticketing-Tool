# 🚀 Quick Reference - Authentication System

## 🔑 **Test Credentials**
```
Admin:    admin / admin123        (29 permissions)
HR:       hr_manager / hr123      (11 permissions)  
Employee: employee / emp123       (6 permissions)
```

## 🌐 **Key Endpoints**
```
Login:    POST /api/auth/login/
Refresh:  POST /api/auth/refresh/
Logout:   POST /api/auth/logout/
Test:     GET  /api/auth/test/
Stats:    GET  /api/auth/stats/
Admin:    GET  /admin/
```

## 🎯 **Quick Login Test**
```powershell
$login = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -Body (@{username="admin"; password="admin123"} | ConvertTo-Json) -ContentType "application/json"
$token = $login.access
$headers = @{Authorization = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/test/" -Method GET -Headers $headers
```

## 🔐 **JWT Token Contains**
- `sub`: User ID (string)
- `permissions`: Array of permission strings
- `username`: Username
- `email`: User email
- `exp`: Expiration (30 min for access, 7 days for refresh)

## ⚡ **Key Features**
- ✅ JWT with permissions array
- ✅ 30min access / 7day refresh tokens
- ✅ Token rotation & blacklisting
- ✅ Permission-based access control
- ✅ Real-time monitoring & logs

## 🔧 **Integration**
1. Use same SECRET_KEY for token validation
2. Extract permissions from JWT `permissions` array
3. Use `sub` claim for user identification
4. Handle token refresh when expired