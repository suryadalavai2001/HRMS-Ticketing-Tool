from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Permission, UserPermission


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User admin with additional fields.
    """
    list_display = ['username', 'email', 'first_name', 'last_name', 'employee_id', 'department', 'is_active', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'department', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'employee_id']
    ordering = ['username']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('HRMS Information', {
            'fields': ('employee_id', 'department', 'position')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('HRMS Information', {
            'fields': ('email', 'employee_id', 'department', 'position')
        }),
    )


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    """
    Admin interface for custom permissions.
    """
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at']


class UserPermissionInline(admin.TabularInline):
    """
    Inline admin for user permissions.
    """
    model = UserPermission
    fk_name = 'user'  # Specify which ForeignKey to use
    extra = 1
    autocomplete_fields = ['permission', 'granted_by']


@admin.register(UserPermission)
class UserPermissionAdmin(admin.ModelAdmin):
    """
    Admin interface for user-permission relationships.
    """
    list_display = ['user', 'permission', 'granted_at', 'granted_by']
    list_filter = ['granted_at', 'permission']
    search_fields = ['user__username', 'user__email', 'permission__name']
    autocomplete_fields = ['user', 'permission', 'granted_by']
    ordering = ['-granted_at']
    readonly_fields = ['granted_at']


# Add UserPermissionInline to UserAdmin
UserAdmin.inlines = [UserPermissionInline]