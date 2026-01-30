from django.urls import path
from .views import tickets_api

urlpatterns = [
    path('', tickets_api, name='tickets_api'),
]