import "../styles/ticketcard.css";

const TicketCard = ({ ticket }) => {
  return (
    <div className="ticket-card">
      <h3>{ticket.title}</h3>
      <p>Status: {ticket.status}</p>
      <p>Priority: {ticket.priority}</p>
      <button>View Details</button>
    </div>
  );
};

export default TicketCard;
