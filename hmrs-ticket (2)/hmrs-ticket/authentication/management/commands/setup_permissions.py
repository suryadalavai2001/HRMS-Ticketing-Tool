from django.core.management.base import BaseCommand
from authentication.models import Permission


class Command(BaseCommand):
    help = 'Create initial permissions for the HRMS & Ticketing system'

    def handle(self, *args, **options):
        """
        Create initial permissions for the system.
        """
        permissions = [
            # User Management
            ('can_view_users', 'Can view user profiles and information'),
            ('can_create_users', 'Can create new user accounts'),
            ('can_edit_users', 'Can edit user profiles and information'),
            ('can_delete_users', 'Can delete user accounts'),
            ('can_manage_users', 'Full user management access'),
            
            # Profile Management
            ('can_view_profile', 'Can view own profile'),
            ('can_edit_profile', 'Can edit own profile'),
            
            # Permission Management
            ('can_view_permissions', 'Can view permissions'),
            ('can_assign_permissions', 'Can assign permissions to users'),
            ('can_manage_permissions', 'Can create, edit, and delete permissions'),
            
            # HRMS Permissions
            ('can_view_employees', 'Can view employee information'),
            ('can_manage_employees', 'Can manage employee records'),
            ('can_view_departments', 'Can view department information'),
            ('can_manage_departments', 'Can manage departments'),
            ('can_view_payroll', 'Can view payroll information'),
            ('can_manage_payroll', 'Can manage payroll'),
            ('can_view_attendance', 'Can view attendance records'),
            ('can_manage_attendance', 'Can manage attendance'),
            
            # Ticketing System Permissions
            ('can_view_tickets', 'Can view tickets'),
            ('can_create_tickets', 'Can create new tickets'),
            ('can_edit_tickets', 'Can edit ticket information'),
            ('can_delete_tickets', 'Can delete tickets'),
            ('can_assign_tickets', 'Can assign tickets to users'),
            ('can_manage_tickets', 'Full ticket management access'),
            ('can_view_all_tickets', 'Can view all tickets in system'),
            
            # System Administration
            ('can_view_system_logs', 'Can view system logs'),
            ('can_manage_system_settings', 'Can manage system settings'),
            ('can_backup_system', 'Can perform system backups'),
            ('can_manage_integrations', 'Can manage system integrations'),
        ]
        
        created_count = 0
        existing_count = 0
        
        for permission_name, description in permissions:
            permission, created = Permission.objects.get_or_create(
                name=permission_name,
                defaults={'description': description}
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created permission: {permission_name}')
                )
            else:
                existing_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Permission already exists: {permission_name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nPermission setup complete!\n'
                f'Created: {created_count} permissions\n'
                f'Already existed: {existing_count} permissions\n'
                f'Total: {len(permissions)} permissions'
            )
        )