from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from authentication.models import Permission, UserPermission

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample users with different permission sets for testing'

    def handle(self, *args, **options):
        """
        Create sample users with different permission levels.
        """
        # Create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@company.com',
                'first_name': 'System',
                'last_name': 'Administrator',
                'employee_id': 'EMP001',
                'department': 'IT',
                'position': 'System Administrator',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created admin user'))
            
            # Give admin all permissions
            all_permissions = Permission.objects.all()
            for permission in all_permissions:
                UserPermission.objects.get_or_create(
                    user=admin_user,
                    permission=permission,
                    defaults={'granted_by': admin_user}
                )
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists'))
        
        # Create HR manager
        hr_manager, created = User.objects.get_or_create(
            username='hr_manager',
            defaults={
                'email': 'hr.manager@company.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'employee_id': 'EMP002',
                'department': 'Human Resources',
                'position': 'HR Manager',
            }
        )
        
        if created:
            hr_manager.set_password('hr123')
            hr_manager.save()
            self.stdout.write(self.style.SUCCESS('Created HR manager user'))
            
            # Give HR manager relevant permissions
            hr_permissions = [
                'can_view_profile', 'can_edit_profile',
                'can_view_employees', 'can_manage_employees',
                'can_view_departments', 'can_manage_departments',
                'can_view_attendance', 'can_manage_attendance',
                'can_view_users', 'can_create_users', 'can_edit_users',
            ]
            
            for perm_name in hr_permissions:
                try:
                    permission = Permission.objects.get(name=perm_name)
                    UserPermission.objects.get_or_create(
                        user=hr_manager,
                        permission=permission,
                        defaults={'granted_by': admin_user}
                    )
                except Permission.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'Permission not found: {perm_name}')
                    )
        else:
            self.stdout.write(self.style.WARNING('HR manager user already exists'))
        
        # Create regular employee
        employee, created = User.objects.get_or_create(
            username='employee',
            defaults={
                'email': 'john.doe@company.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'employee_id': 'EMP003',
                'department': 'Sales',
                'position': 'Sales Representative',
            }
        )
        
        if created:
            employee.set_password('emp123')
            employee.save()
            self.stdout.write(self.style.SUCCESS('Created employee user'))
            
            # Give employee basic permissions
            employee_permissions = [
                'can_view_profile', 'can_edit_profile',
                'can_view_tickets', 'can_create_tickets', 'can_edit_tickets',
                'can_view_attendance',
            ]
            
            for perm_name in employee_permissions:
                try:
                    permission = Permission.objects.get(name=perm_name)
                    UserPermission.objects.get_or_create(
                        user=employee,
                        permission=permission,
                        defaults={'granted_by': admin_user}
                    )
                except Permission.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'Permission not found: {perm_name}')
                    )
        else:
            self.stdout.write(self.style.WARNING('Employee user already exists'))
        
        self.stdout.write(
            self.style.SUCCESS(
                '\nSample data creation complete!\n'
                'Users created:\n'
                '- admin (admin123) - Full system access\n'
                '- hr_manager (hr123) - HR management access\n'
                '- employee (emp123) - Basic employee access'
            )
        )