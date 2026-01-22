from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.contrib.auth import get_user_model
from django.db.models import Count
from authentication.models import UserPermission
import os
from datetime import datetime, timedelta

User = get_user_model()

@require_http_methods(["GET"])
def api_stats(request):
    """
    API endpoint to show system statistics and current users.
    """
    
    # Get user statistics
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    
    # Get permission statistics
    total_permissions = UserPermission.objects.values('permission__name').distinct().count()
    
    # Get users with their permission counts
    users_with_permissions = []
    for user in User.objects.filter(is_active=True)[:10]:  # Limit to 10 users
        permission_count = UserPermission.objects.filter(user=user).count()
        permissions = list(UserPermission.objects.filter(user=user).values_list('permission__name', flat=True)[:5])
        
        users_with_permissions.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'department': getattr(user, 'department', 'N/A'),
            'position': getattr(user, 'position', 'N/A'),
            'permission_count': permission_count,
            'sample_permissions': permissions,
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'date_joined': user.date_joined.isoformat(),
        })
    
    # Check if log file exists and get recent entries
    log_entries = []
    log_file_path = 'api_access.log'
    if os.path.exists(log_file_path):
        try:
            with open(log_file_path, 'r') as f:
                lines = f.readlines()
                # Get last 10 log entries
                log_entries = [line.strip() for line in lines[-10:] if line.strip()]
        except Exception as e:
            log_entries = [f"Error reading log file: {str(e)}"]
    
    stats = {
        'system_info': {
            'total_users': total_users,
            'active_users': active_users,
            'total_permissions': total_permissions,
            'server_time': datetime.now().isoformat(),
        },
        'active_users': users_with_permissions,
        'recent_api_access': log_entries,
        'endpoints': {
            'authentication': [
                'POST /api/auth/login/',
                'POST /api/auth/refresh/',
                'POST /api/auth/logout/',
            ],
            'protected': [
                'GET /api/auth/test/',
                'GET /api/auth/admin-test/',
                'GET /api/auth/profile/',
            ],
            'monitoring': [
                'GET /api/auth/stats/',
            ]
        }
    }
    
    return JsonResponse(stats, json_dumps_params={'indent': 2})

@require_http_methods(["GET"])
def who_is_online(request):
    """
    Show who is currently accessing the system based on recent activity.
    """
    
    # Get users who logged in recently (last 24 hours)
    recent_threshold = datetime.now() - timedelta(hours=24)
    recent_users = User.objects.filter(
        last_login__gte=recent_threshold,
        is_active=True
    ).order_by('-last_login')
    
    online_users = []
    for user in recent_users:
        permissions = list(UserPermission.objects.filter(user=user).values_list('permission__name', flat=True))
        
        online_users.append({
            'username': user.username,
            'email': user.email,
            'department': getattr(user, 'department', 'N/A'),
            'position': getattr(user, 'position', 'N/A'),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'permissions': permissions,
            'permission_count': len(permissions),
        })
    
    return JsonResponse({
        'timestamp': datetime.now().isoformat(),
        'recent_users_count': len(online_users),
        'threshold_hours': 24,
        'users': online_users
    }, json_dumps_params={'indent': 2})