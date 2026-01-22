# Ticketing Backend – Django (JWT Secured)

This Django backend powers the Ticketing System and is integrated with the HRMS Authentication module.

All Ticket APIs are protected using JWT authentication. The backend does not handle login itself — it trusts tokens issued by the HRMS authentication system.

---

## 🚀 Tech Stack

- Django
- Django REST Framework
- SimpleJWT (JWT Authentication)
- SQLite (for demo/testing)
- django-cors-headers

---

## 📂 Project Structure

- `authentication/` → Handles users, permissions, JWT
- `tickets/` → Ticket model and ticket APIs
- `hrms_ticketing/` → Project settings and URL routing

---

## ⚙️ Setup Instructions

### 1️⃣ Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate
2️⃣ Install Dependencies
bash
Copy code
pip install django
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
3️⃣ Apply Migrations
bash
Copy code
python manage.py makemigrations
python manage.py migrate
4️⃣ Create Admin User
bash
Copy code
python manage.py createsuperuser
5️⃣ Run Server
bash
Copy code
python manage.py runserver
Backend runs at:

cpp
Copy code
http://127.0.0.1:8000
🔐 Authentication Flow (Very Important)
This backend does not allow unauthenticated access.

To access ticket APIs:

Login using HRMS auth API:

swift
Copy code
POST /api/auth/login/
Copy the access token from response.

Use token in header:

makefile
Copy code
Authorization: Bearer <access_token>
🎫 Tickets API
bash
Copy code
GET /api/tickets/
Returns all tickets from the database.

This API is JWT protected.

🧪 Admin Panel
Tickets can be added from Django Admin:

arduino
Copy code
http://127.0.0.1:8000/admin/
Use the superuser credentials to login and create tickets.