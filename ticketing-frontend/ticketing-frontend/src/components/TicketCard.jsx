import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ticketcard.css";

const TicketCard = ({ ticket }) => {
  const navigate = useNavigate();

  return (
    <div className="ticket-card">
      <h3>{ticket.title}</h3>
      <p>Status: {ticket.status}</p>
      <p>Priority: {ticket.priority}</p>

      {/* Navigate to the unique ID of the ticket */}
      <button onClick={() => navigate(`/tickets/${ticket.id}`)}>
        View Details
      </button>
    </div>
  );
};

export default TicketCard;