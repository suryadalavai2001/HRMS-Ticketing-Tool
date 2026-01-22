import "../styles/dashboard.css";
import TicketCard from "../components/TicketCard";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/tickets/")
      .then(res => res.json())
      .then(data => {
        console.log("Tickets from API:", data);  // 👈 important
        setTickets(data);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="dashboard">
      <h2>My Tickets</h2>

      <div className="ticket-grid">
        {tickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
