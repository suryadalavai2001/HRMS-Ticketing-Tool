from django.urls import path
from .views import get_tickets

urlpatterns = [
    path('', get_tickets),
]
