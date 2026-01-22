import React, { useEffect, useState } from "react";
import TicketCard from "../components/TicketCard";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/tickets/")
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
      })
      .catch((err) => console.log("Error fetching tickets:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Tickets</h2>

      {tickets.length === 0 ? (
        <p>No tickets found</p>
      ) : (
        tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            title={ticket.title}
            status={ticket.status}
            priority={ticket.priority}
          />
        ))
      )}
    </div>
  );
};

export default Tickets;
