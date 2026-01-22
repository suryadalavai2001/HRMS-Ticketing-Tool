from django.urls import path
from .views import (
    CustomLoginView,
    CustomRefreshView,
    LogoutView,
    UserProfileView,
    protected_test_view,
    admin_test_view,
    CreateUserAPIView,
    UpdateUserAPIView,
    DisableUserAPIView
)
from .api_monitor import api_stats, who_is_online

urlpatterns = [
    # Authentication endpoints
    path('login/', CustomLoginView.as_view(), name='login'),
    path('refresh/', CustomRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # User profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),

    # Test endpoints
    path('test/', protected_test_view, name='protected_test'),
    path('admin-test/', admin_test_view, name='admin_test'),

    # Monitoring endpoints
    path('stats/', api_stats, name='api_stats'),
    path('who-is-online/', who_is_online, name='who_is_online'),
]

# HRMS User Management (ONLY HRMS can manage users)
urlpatterns += [
    path('users/create/', CreateUserAPIView.as_view(), name='create_user'),
    path('users/<int:user_id>/update/', UpdateUserAPIView.as_view(), name='update_user'),
    path('users/<int:user_id>/disable/', DisableUserAPIView.as_view(), name='disable_user'),
]
