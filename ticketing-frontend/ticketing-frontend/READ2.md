# Ticketing Frontend – React

This React frontend displays tickets by fetching data from the Django backend using JWT authentication.

Tickets are dynamically loaded from the backend API and are not hardcoded.

---

## 🚀 Tech Stack

- React
- Fetch API
- CSS

---

## ⚙️ Setup Instructions

### 1️⃣ Install Dependencies

```bash
npm install
2️⃣ Run React App
bash
Copy code
npm start
Frontend runs at:

arduino
Copy code
http://localhost:3000
🔐 Authentication Requirement
This frontend expects a JWT access token stored in browser localStorage.

After HRMS login, store token like this:

js
Copy code
localStorage.setItem("access_token", "<JWT_TOKEN>");
The Dashboard automatically uses this token to call:

ruby
Copy code
GET http://127.0.0.1:8000/api/tickets/
🎯 Dashboard Behavior
Tickets are fetched from backend API

API call includes JWT in header

If token is missing → tickets will not load

No login in ticketing UI (uses HRMS auth)

📂 Important Files
pages/Dashboard.jsx → Fetches tickets from backend

components/TicketCard.jsx → Displays ticket details

styles/ → UI styling

✅ What this frontend demonstrates
Live integration with Django backend

JWT-based API calls

Dynamic rendering of ticket data

Proper separation of frontend and backe