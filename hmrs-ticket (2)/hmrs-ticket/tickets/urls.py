from django.urls import path
from .views import tickets_api, ticket_detail_api  # We will create this next

urlpatterns = [
    path('', tickets_api, name='tickets_api'),                  # List/Create
    path('<int:pk>/', ticket_detail_api, name='ticket_detail'), # ✅ ADDED: Get Single Ticket
]