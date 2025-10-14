# 🛒 Professional E-Commerce Platform - MEAN Stack

A fully-featured, production-ready e-commerce application built with MongoDB Atlas, Express.js, Angular, and Node.js.

![MEAN Stack](https://img.shields.io/badge/Stack-MEAN-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Angular](https://img.shields.io/badge/Angular-17-red)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue)

## 🌟 Features

### Three Powerful Panels

#### 🛍️ **Buyer Panel**
- Browse products with advanced filtering
- Shopping cart management
- Secure checkout (Stripe & COD)
- Order tracking
- Product reviews and ratings
- Profile management

#### 🏪 **Seller Panel**
- Seller dashboard with analytics
- Product CRUD operations
- Inventory management
- Order fulfillment
- Sales tracking

#### 👨‍💼 **Admin Panel**
- System-wide dashboard
- User management
- Product oversight
- Order management
- Revenue reports
- Analytics with charts

### 🔐 **Security & Authentication**
- JWT-based authentication
- Role-based access control
- Password encryption (bcrypt)
- Protected API routes
- Secure payment processing

### 💳 **Payment Integration**
- Stripe payment gateway
- Cash on Delivery option
- Payment status tracking
- Refund processing

### 🎨 **Modern UI/UX**
- Tailwind CSS 3.4.17
- Responsive design
- Smooth animations
- Loading states
- Toast notifications
- Modal dialogs

## 📁 Project Structure

```
e-commerce/
├── backend/          # Node.js + Express + TypeScript (OOP)
├── frontend/         # Angular (Buyer + Seller Panel)
├── admin/            # Angular (Admin Panel)
├── SETUP_GUIDE.md    # Detailed setup instructions
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Angular CLI 17
- MongoDB Atlas account
- Stripe account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd e-commerce
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm start
```

4. **Setup Admin Panel**
```bash
cd admin
npm install
npm start
```

### Access Points
- **Frontend:** http://localhost:4200
- **Admin:** http://localhost:4201
- **API:** http://localhost:5000

📖 **For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

## 🏗️ Architecture

### Backend (TypeScript + OOP)
```
backend/src/
├── app/
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic (OOP)
│   ├── middlewares/    # Auth, validation, errors
│   └── utils/          # Helpers
├── config/             # Database config
└── server.ts           # Entry point
```

**Key Features:**
- Strict OOP principles
- Service layer pattern
- Dependency injection
- Error handling middleware
- JWT authentication
- Input validation

### Frontend (Angular)
```
frontend/src/app/
├── auth/              # Authentication
├── buyer/             # Buyer features
├── seller/            # Seller features
├── core/              # Services, guards, models
└── shared/            # Reusable components
```

**Key Features:**
- Standalone: false (module-based)
- Reactive forms
- HTTP interceptors
- Route guards
- State management
- Lazy loading ready

### Admin Panel (Angular)
```
admin/src/app/
├── dashboard/         # Analytics dashboard
├── users/             # User management
├── products/          # Product management
├── orders/            # Order management
└── reports/           # Reports & charts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (Seller)
- `PUT /api/products/:id` - Update product (Seller)
- `DELETE /api/products/:id` - Delete product (Seller)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update status

### Payment
- `GET /api/payment/config` - Get Stripe key
- `POST /api/payment/create-intent` - Create payment
- `POST /api/payment/confirm` - Confirm payment

### Admin
- `GET /api/users` - Get all users
- `GET /api/orders/admin/all` - Get all orders
- `GET /api/products/admin/stats` - Get statistics

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Stripe** - Payment processing

### Frontend
- **Angular 17** - Framework
- **TypeScript** - Language
- **RxJS** - Reactive programming
- **Tailwind CSS 3.4.17** - Styling
- **Stripe.js** - Payment UI

### DevOps
- **Git** - Version control
- **npm** - Package manager
- **Nodemon** - Development
- **Angular CLI** - Build tools

## 📊 Database Models

### User
- name, email, password, role
- phone, address, avatar
- isActive, timestamps

### Product
- seller, name, description, price
- category, brand, images, stock
- rating, reviews, timestamps

### Order
- user, orderItems, shippingAddress
- paymentMethod, paymentStatus
- orderStatus, totalPrice, timestamps

## 🎯 User Roles

### Admin
- Full system access
- Manage all users, products, orders
- View analytics and reports
- System configuration

### Seller
- Manage own products
- View and fulfill orders
- Track sales
- Update inventory

### Buyer
- Browse and search products
- Add to cart and checkout
- Track orders
- Write reviews

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation
- XSS protection
- CORS configuration
- Rate limiting ready
- Secure payment processing

## 🎨 UI Components

- Responsive navigation
- Product cards with hover effects
- Shopping cart
- Checkout form
- Order history table
- Dashboard charts
- User management table
- Modal dialogs
- Loading spinners
- Toast notifications

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimized
- Desktop enhanced
- Touch-friendly
- Accessible

## 🧪 Testing

### Test Accounts
Create users with different roles:
- Admin: admin@example.com
- Seller: seller@example.com
- Buyer: buyer@example.com

### Test Payments
Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

## 📈 Performance

- Lazy loading routes
- Image optimization
- API response caching
- Database indexing
- Pagination
- Efficient queries

## 🚀 Deployment

### Backend
- Heroku, AWS, DigitalOcean
- Environment variables
- Production MongoDB
- SSL/TLS enabled

### Frontend
- Netlify, Vercel, Firebase
- Production build
- CDN integration
- Environment configuration

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_sk
STRIPE_PUBLISHABLE_KEY=your_stripe_pk
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

Built with ❤️ using the MEAN stack

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Stripe for payment processing
- Tailwind CSS for styling
- Angular team for the framework
- Node.js community

## 📞 Support

For issues and questions:
- Check SETUP_GUIDE.md
- Review API documentation
- Open an issue on GitHub

---

**⭐ Star this repository if you find it helpful!**

**🚀 Happy Coding!**
