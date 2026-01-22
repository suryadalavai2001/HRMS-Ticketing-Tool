from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Ticket

@api_view(['GET'])

def get_tickets(request):
    tickets = Ticket.objects.all().values()
    return Response(list(tickets))
