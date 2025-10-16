# 🛒 E-Commerce MEAN Stack Application - Complete Setup Guide
SHIBHAM
A professional, full-stack e-commerce platform built with MongoDB Atlas, Express.js, Angular, and Node.js.

## 📋 Table of Contents
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup (Buyer Panel)](#frontend-setup-buyer-panel)
- [Admin Panel Setup](#admin-panel-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Features](#features)
- [API Documentation](#api-documentation)

---
## 📁 Project Structure

```
e-commerce/
├── backend/                    # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── app/
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── models/        # Mongoose models
│   │   │   ├── routes/        # API routes
│   │   │   ├── services/      # Business logic (OOP)
│   │   │   ├── middlewares/   # Auth, error handling
│   │   │   └── utils/         # Helper functions
│   │   ├── config/            # Database config
│   │   └── server.ts          # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # Angular (Buyer + Seller Panel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/          # Login/Register
│   │   │   ├── buyer/         # Buyer features
│   │   │   │   ├── products/
│   │   │   │   ├── cart/
│   │   │   │   ├── orders/
│   │   │   │   └── profile/
│   │   │   ├── seller/        # Seller features
│   │   │   │   ├── dashboard/
│   │   │   │   ├── products/
│   │   │   │   ├── orders/
│   │   │   │   └── profile/
│   │   │   ├── core/          # Services, guards, models
│   │   │   └── shared/        # Shared components
│   │   ├── environments/
│   │   └── styles.css
│   ├── package.json
│   ├── angular.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── admin/                      # Angular (Admin Panel)
    ├── src/
    │   ├── app/
    │   │   ├── dashboard/     # Admin dashboard
    │   │   ├── users/         # User management
    │   │   ├── products/      # Product management
    │   │   ├── orders/        # Order management
    │   │   └── reports/       # Analytics & reports
    │   └── styles.css
    ├── package.json
    ├── angular.json
    └── tailwind.config.js
```

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Angular CLI** (v17) - Install globally: `npm install -g @angular/cli`
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Stripe Account** - [Sign up](https://stripe.com/)

---

## 🚀 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Frontend URLs
FRONTEND_URL=http://localhost:4200
ADMIN_URL=http://localhost:4201
```

**Important:** Replace the placeholder values with your actual credentials:
- Get MongoDB URI from [MongoDB Atlas](https://cloud.mongodb.com/)
- Get Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

### 4. Build TypeScript
```bash
npm run build
```

### 5. Start Development Server
```bash
npm run dev
```

The backend will run on **http://localhost:5000**

### 6. Verify Backend
Open browser and navigate to: `http://localhost:5000/api/health`

You should see:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🎨 Frontend Setup (Buyer Panel)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
The environment file is already configured at `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

### 4. Start Development Server
```bash
npm start
```

The frontend will run on **http://localhost:4200**

---

## 👨‍💼 Admin Panel Setup

### 1. Navigate to Admin Directory
```bash
cd admin
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Copy Core Files from Frontend
Since admin panel shares models and services with frontend, you can either:
- Copy the `core` folder from frontend to admin
- Or create symbolic links (advanced)

### 4. Start Development Server
```bash
npm start
```

The admin panel will run on **http://localhost:4201**

---

## ⚙️ Environment Configuration

### MongoDB Atlas Setup

1. **Create a Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a new cluster (Free tier available)
   - Wait for cluster to be created

2. **Create Database User**
   - Go to Database Access
   - Add new database user
   - Save username and password

3. **Whitelist IP Address**
   - Go to Network Access
   - Add IP Address (0.0.0.0/0 for development)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Stripe Setup

1. **Get API Keys**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Navigate to Developers → API Keys
   - Copy "Publishable key" and "Secret key"
   - Use TEST keys for development

2. **Configure Webhook (Optional)**
   - For production, set up webhooks for payment events

---

## 🏃 Running the Application

### Development Mode

1. **Start Backend** (Terminal 1)
```bash
cd backend
npm run dev
```

2. **Start Frontend** (Terminal 2)
```bash
cd frontend
npm start
```

3. **Start Admin Panel** (Terminal 3)
```bash
cd admin
npm start
```

### Access the Applications

- **Frontend (Buyer/Seller):** http://localhost:4200
- **Admin Panel:** http://localhost:4201
- **Backend API:** http://localhost:5000

---

## ✨ Features

### 🛍️ Buyer Panel
- Browse products with filters (category, price, rating)
- Search functionality
- Add products to cart
- Place orders (COD or Stripe payment)
- View order history and status
- Manage profile
- Product reviews and ratings

### 🏪 Seller Panel
- Seller dashboard with statistics
- CRUD operations on products
- Manage product stock, price, and images
- View and manage received orders
- Update order status
- Profile management

### 👨‍💼 Admin Panel
- Comprehensive dashboard with charts
- User management (buyers & sellers)
- Product management (all products)
- Order management (all orders)
- System reports and analytics
- Revenue tracking

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Admin, Buyer, Seller)
- Password hashing with bcrypt
- Protected routes and API endpoints

### 💳 Payment Integration
- Stripe payment gateway
- Cash on Delivery (COD) option
- Payment status tracking
- Refund processing (Admin only)

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Product Endpoints

#### Get All Products
```http
GET /products?page=1&limit=12&category=Electronics&minPrice=100&maxPrice=1000
```

#### Get Product by ID
```http
GET /products/:id
```

#### Create Product (Seller/Admin)
```http
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "Electronics",
  "brand": "Brand Name",
  "images": ["url1", "url2"],
  "stock": 100
}
```

### Order Endpoints

#### Create Order
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderItems": [
    {
      "product": "product_id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "stripe"
}
```

#### Get My Orders
```http
GET /orders/my-orders?page=1&limit=10
Authorization: Bearer {token}
```

### Payment Endpoints

#### Get Stripe Publishable Key
```http
GET /payment/config
```

#### Create Payment Intent
```http
POST /payment/create-intent
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 99.99,
  "currency": "usd",
  "metadata": {
    "orderId": "order_id_here"
  }
}
```

---

## 🎨 UI/UX Features

### Tailwind CSS Styling
- Modern, responsive design
- Custom color palette
- Smooth animations and transitions
- Mobile-first approach

### Components
- Reusable header and footer
- Loading spinners
- Toast notifications
- Modal dialogs
- Data tables with sorting and filtering
- Pagination
- Form validation

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use strong JWT secrets** - Generate random strings
3. **Enable CORS properly** - Configure allowed origins
4. **Validate all inputs** - Use express-validator
5. **Hash passwords** - Using bcrypt with salt rounds
6. **Use HTTPS in production** - SSL/TLS certificates
7. **Rate limiting** - Prevent brute force attacks
8. **Input sanitization** - Prevent XSS and SQL injection

---

## 📦 Production Deployment

### Backend (Node.js)
- Deploy to: Heroku, AWS, DigitalOcean, or Vercel
- Set environment variables in hosting platform
- Use production MongoDB cluster
- Enable HTTPS

### Frontend & Admin (Angular)
- Build: `ng build --configuration production`
- Deploy to: Netlify, Vercel, AWS S3, or Firebase Hosting
- Update API URL to production backend

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
- Check MongoDB URI format
- Verify database user credentials
- Whitelist your IP address in MongoDB Atlas

**Port Already in Use**
- Change PORT in `.env` file
- Or kill process using the port

### Frontend Issues

**API Calls Failing**
- Verify backend is running
- Check API URL in environment files
- Check browser console for CORS errors

**Tailwind Styles Not Working**
- Run `npm install` to ensure dependencies are installed
- Verify `tailwind.config.js` content paths
- Restart development server

---

## 📝 Additional Notes

### Default User Roles
- **Admin**: Full system access
- **Seller**: Can manage own products and orders
- **Buyer**: Can browse, purchase, and review products

### Test Stripe Cards
For testing payments, use:
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

### Database Seeding
To add sample data, you can create a seed script or manually add products through the seller panel.

---

## 🤝 Contributing

This is a complete e-commerce solution. Feel free to:
- Add more features
- Improve UI/UX
- Optimize performance
- Add tests

---

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

---

## 🎯 Next Steps

1. ✅ Set up MongoDB Atlas
2. ✅ Configure Stripe account
3. ✅ Install all dependencies
4. ✅ Start all three servers
5. ✅ Register test users (buyer, seller, admin)
6. ✅ Add sample products
7. ✅ Test complete purchase flow

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation
- Check browser console for errors
- Verify environment variables

---

**Happy Coding! 🚀**
