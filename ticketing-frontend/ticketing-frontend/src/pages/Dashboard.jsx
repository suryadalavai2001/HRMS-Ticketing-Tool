import "../styles/dashboard.css";
import TicketCard from "../components/TicketCard";
import { useEffect, useState } from "react";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = getCookie('access_token');

        if (!token) {
          alert("You are not logged in! Please log in via HRMS.");
          window.location.href = "http://localhost:3000/login";
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/tickets/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          alert("Session expired. Please login again.");
        }

        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
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
