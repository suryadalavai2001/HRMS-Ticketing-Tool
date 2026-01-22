# Project Setup Commands

## 1. Create Virtual Environment and Install Dependencies
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## 2. Create Django Project and App
```bash
django-admin startproject hrms_ticketing .
cd hrms_ticketing
python manage.py startapp authentication
```

## 3. Run Initial Migration
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## 4. Run Development Server
```bash
python manage.py runserver
```