from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Ticket
from .serializers import TicketSerializer

# ===========================
# 1. List & Create Tickets
# ===========================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def tickets_api(request):
    # GET: List all tickets
    if request.method == 'GET':
        tickets = Ticket.objects.all()
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)
    
    # POST: Create a new ticket
    elif request.method == 'POST':
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ===========================
# 2. Ticket Details (Get, Update, Delete)
# ===========================
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def ticket_detail_api(request, pk):
    try:
        ticket = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

    # GET: View single ticket details
    if request.method == 'GET':
        serializer = TicketSerializer(ticket)
        return Response(serializer.data)

    # PUT: Update ticket
    elif request.method == 'PUT':
        serializer = TicketSerializer(ticket, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE: Delete ticket
    elif request.method == 'DELETE':
        ticket.delete()
        return Response({'message': 'Ticket deleted successfully'}, status=status.HTTP_204_NO_CONTENT)