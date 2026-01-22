from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserPermission


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that injects user permissions into the token payload.
    The token will contain 'sub' (user ID) and 'permissions' (flat array of permission strings).
    """
    
    @classmethod
    def get_token(cls, user):
        """
        Override to add custom claims to the JWT token.
        Fetches user permissions from database and adds them as a flat array.
        """
        token = super().get_token(user)
        
        # Ensure sub claim is a string (required by JWT spec)
        token['sub'] = str(user.id)
        
        # Get user permissions from database
        user_permissions = UserPermission.objects.filter(
            user=user
        ).select_related('permission').values_list('permission__name', flat=True)
        
        # Add permissions as a flat array to token payload
        token['permissions'] = list(user_permissions)
        
        # Add additional user info if needed
        token['username'] = user.username
        token['email'] = user.email
        
        return token

    def validate(self, attrs):
        """
        Override validate to ensure user is active and exists.
        """
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'Invalid credentials. Please check your username and password.'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled. Please contact your administrator.'
                )
            
            # Call parent validate to get tokens
            validated_data = super().validate(attrs)
            # Add user to validated data
            validated_data['user'] = user
            return validated_data
        else:
            raise serializers.ValidationError(
                'Username and password are required.'
            )


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model - used for user profile information.
    """
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'employee_id', 'department', 'position', 'is_active',
            'date_joined', 'permissions'
        ]
        read_only_fields = ['id', 'date_joined', 'is_active']
    
    def get_permissions(self, obj):
        """
        Get user permissions as a flat array of strings.
        """
        return list(
            UserPermission.objects.filter(user=obj)
            .values_list('permission__name', flat=True)
        )

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'password',
            'employee_id',
            'department',
            'position',
        )

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = True
        user.save()
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'email',
            'department',
            'position',
            'is_active',
        )
