# 🛒 ShopCom - Full Stack E-Commerce Platform

<div align="center">

![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A modern e-commerce platform built with Django REST Framework and React**

</div>

---

## ✨ Features

- User authentication (JWT-based)
- Product catalog with category filtering and search
- Shopping cart management
- Order processing with fake payment
- Admin dashboard with analytics
- Stock management and validation

---

## 🛠️ Tech Stack

**Backend:** Django, Django REST Framework, PostgreSQL, JWT, Pillow  
**Frontend:** React, Vite, TailwindCSS, Axios, React Router

---

## 🚀 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Backend Setup

1. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up database**
   ```sql
   CREATE DATABASE ecommerce_db;
   ```

4. **Update database settings** in `Ecom_Backend/settings.py`

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start server**
   ```bash
   python manage.py runserver
   ```
   Backend: `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd Fronted
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend: `http://localhost:5173`

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register user
- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/profile/` - Get profile

### Products
- `GET /api/products/` - List products (query: `category`, `search`)
- `GET /api/products/{id}/` - Product details
- `POST /api/products/` - Create (Admin)
- `PATCH /api/products/{id}/` - Update (Admin)
- `DELETE /api/products/{id}/` - Delete (Admin)

### Categories
- `GET /api/categories/` - List categories
- `POST /api/categories/` - Create (Admin)
- `PATCH /api/categories/{id}/` - Update (Admin)
- `DELETE /api/categories/{id}/` - Delete (Admin)

### Cart
- `GET /api/cart/` - Get cart
- `POST /api/cart/add_item/` - Add item
- `PATCH /api/cart/update_item/` - Update item
- `DELETE /api/cart/remove_item/` - Remove item
- `POST /api/cart/clear/` - Clear cart

### Orders
- `GET /api/orders/` - List orders
- `POST /api/orders/` - Create order
- `POST /api/orders/{id}/confirm_payment/` - Confirm payment (fake)
- `PATCH /api/orders/{id}/update_status/` - Update status (Admin)
- `GET /api/orders/analytics/` - Analytics (Admin)

---

## ⚙️ Configuration

Update `CORS_ALLOWED_ORIGINS` in `Ecom_Backend/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

---

<div align="center">

**Made with ❤️ using Django and React**

</div>
