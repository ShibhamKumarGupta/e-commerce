# E-commerce Backend API

A professional, scalable backend built with Node.js, Express, TypeScript, and MongoDB Atlas following OOP principles.

## 🚀 Features

- **TypeScript & OOP Architecture**: Fully typed with strict OOP patterns
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin, Seller, and Buyer roles
- **Stripe Payment Integration**: Secure payment processing
- **MongoDB Atlas**: Cloud database with Mongoose ODM
- **RESTful API**: Clean and intuitive API endpoints
- **Error Handling**: Centralized error handling middleware
- **Validation**: Request validation with express-validator

## 📁 Project Structure

```
backend/
├── src/
│   ├── app/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── middlewares/      # Custom middlewares
│   │   └── utils/            # Utility functions
│   ├── config/               # Configuration files
│   └── server.ts             # Application entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   - MongoDB Atlas URI
   - JWT Secret
   - Stripe Keys
   - Frontend URLs

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Start production server:**
   ```bash
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `PUT /api/auth/change-password` - Change password (Protected)

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/toggle-status` - Toggle user status

### Products
- `GET /api/products` - Get all products (Public)
- `GET /api/products/categories` - Get categories (Public)
- `GET /api/products/:id` - Get product by ID (Public)
- `POST /api/products` - Create product (Seller/Admin)
- `PUT /api/products/:id` - Update product (Seller/Admin)
- `DELETE /api/products/:id` - Delete product (Seller/Admin)
- `POST /api/products/:id/reviews` - Add review (Authenticated)

### Orders
- `POST /api/orders` - Create order (Authenticated)
- `GET /api/orders/my-orders` - Get user orders (Authenticated)
- `GET /api/orders/seller/orders` - Get seller orders (Seller)
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `GET /api/orders/:id` - Get order by ID (Authenticated)
- `PATCH /api/orders/:id/status` - Update order status (Seller/Admin)
- `PATCH /api/orders/:id/payment` - Update payment status (Authenticated)
- `PATCH /api/orders/:id/cancel` - Cancel order (Authenticated)

### Payment
- `GET /api/payment/config` - Get Stripe publishable key (Public)
- `POST /api/payment/create-intent` - Create payment intent (Authenticated)
- `POST /api/payment/confirm` - Confirm payment (Authenticated)
- `POST /api/payment/refund` - Refund payment (Admin)

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 👥 User Roles

- **Admin**: Full system access
- **Seller**: Can manage own products and orders
- **Buyer**: Can browse, purchase, and review products

## 🗄️ Database Models

### User
- name, email, password, role, phone, address, avatar, isActive

### Product
- seller, name, description, price, category, brand, images, stock, rating, reviews

### Order
- user, orderItems, shippingAddress, paymentMethod, paymentStatus, orderStatus, totalPrice

## 💳 Stripe Integration

The API uses Stripe for payment processing:
- Create payment intents
- Confirm payments
- Process refunds (Admin only)

## 🔧 Environment Variables

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=http://localhost:4200
ADMIN_URL=http://localhost:4201
```

## 📝 License

MIT
