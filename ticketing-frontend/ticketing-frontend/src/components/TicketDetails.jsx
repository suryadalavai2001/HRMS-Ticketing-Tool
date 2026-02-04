import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TicketDetails = () => {
    const { id } = useParams(); // Reads "1" from URL
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        const fetchTicket = async () => {
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/tickets/${id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setTicket(data);
            } catch (error) {
                console.error("Error:", error);
            }
        };
        fetchTicket();
    }, [id]);

    if (!ticket) return <div style={{ padding: "20px" }}>Loading...</div>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>{ticket.title}</h2>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Description:</strong> {ticket.description}</p>

            <button onClick={() => navigate('/')} style={{ marginTop: "20px" }}>
                Back to Dashboard
            </button>
        </div>
    );
};

export default TicketDetails;