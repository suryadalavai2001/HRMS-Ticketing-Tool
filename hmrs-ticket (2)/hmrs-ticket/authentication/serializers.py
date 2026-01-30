from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import User, UserPermission

# ✅ FIX: Removed "from .models import Ticket" (This was causing the crash)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['sub'] = str(user.id)
        token['user_id'] = str(user.id)
        token['username'] = user.username
        token['email'] = user.email
        
        # Safe Permission Fetching
        try:
            user_permissions = UserPermission.objects.filter(user=user).select_related('permission')
            token['permissions'] = [up.permission.name for up in user_permissions]
        except Exception:
            token['permissions'] = []
            
        return token

    def validate(self, attrs):
        # Allow Login with Username OR Email
        username_or_email = attrs.get('username') or attrs.get('email')
        password = attrs.get('password')

        if username_or_email and password:
            user_obj = User.objects.filter(
                Q(username=username_or_email) | Q(email=username_or_email)
            ).first()

            if user_obj:
                if not user_obj.check_password(password):
                    raise serializers.ValidationError('Invalid credentials')
                if not user_obj.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                attrs['username'] = user_obj.username
            else:
                raise serializers.ValidationError('Invalid credentials')

            data = super().validate(attrs)
            return data
            
        raise serializers.ValidationError('Username/Email and password are required.')

class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'employee_id', 'department', 'position', 'is_active', 'permissions']
    def get_permissions(self, obj):
        try:
            return list(UserPermission.objects.filter(user=obj).values_list('permission__name', flat=True))
        except Exception:
            return []

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'employee_id', 'department', 'position')
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'department', 'position', 'is_active')