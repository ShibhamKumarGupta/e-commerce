import swaggerJsdoc from 'swagger-jsdoc';
import { EnvironmentConfig } from './environment.config';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce API Documentation',
    version: '1.0.0',
    description: `
# E-Commerce Multi-Vendor Platform API

This is a comprehensive REST API for a multi-vendor e-commerce platform built with Node.js, Express, TypeScript, and MongoDB.

## Features
- 🔐 JWT-based authentication
- 👥 Multi-role system (Admin, Buyer, Seller)
- 🛍️ Product management with reviews
- 📦 Order processing with sub-orders
- 💳 Stripe payment integration
- 📊 Analytics and reporting
- 🏷️ Category management

## Authentication
Most endpoints require authentication. Use the \`/api/auth/login\` or \`/api/auth/register\` endpoints to obtain a JWT token.
Then include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your-token-here>
\`\`\`

## Roles
- **Admin**: Full access to all features
- **Seller**: Can manage their own products and view their orders
- **Buyer**: Can browse products, place orders, and manage their profile

## Testing Tips
1. Start by registering a user with desired role
2. Login to get the JWT token
3. Use the token for authenticated requests
4. Check the required roles for each endpoint
    `,
    contact: {
      name: 'API Support',
      email: 'support@ecommerce.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${EnvironmentConfig.port}/api`,
      description: 'Development server',
    },
    {
      url: 'https://api.yourdomain.com/api',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from login',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          role: { type: 'string', enum: ['admin', 'buyer', 'seller'], example: 'buyer' },
          phone: { type: 'string', example: '+1234567890' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string', example: '123 Main St' },
              city: { type: 'string', example: 'New York' },
              state: { type: 'string', example: 'NY' },
              zipCode: { type: 'string', example: '10001' },
              country: { type: 'string', example: 'USA' },
            },
          },
          avatar: { type: 'string', format: 'uri', example: 'https://example.com/avatar.jpg' },
          isActive: { type: 'boolean', example: true },
          commissionRate: { type: 'number', example: 10 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          seller: { type: 'string', example: '507f1f77bcf86cd799439012' },
          name: { type: 'string', example: 'Wireless Headphones' },
          description: { type: 'string', example: 'High-quality wireless headphones with noise cancellation' },
          price: { type: 'number', example: 99.99 },
          category: { type: 'string', example: 'Electronics' },
          brand: { type: 'string', example: 'TechBrand' },
          images: { 
            type: 'array', 
            items: { type: 'string' },
            example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
          },
          stock: { type: 'number', example: 50 },
          rating: { type: 'number', example: 4.5 },
          numReviews: { type: 'number', example: 10 },
          reviews: {
            type: 'array',
            items: { $ref: '#/components/schemas/Review' }
          },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          user: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'John Doe' },
          rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
          comment: { type: 'string', example: 'Great product!' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          user: { type: 'string', example: '507f1f77bcf86cd799439012' },
          orderItems: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' }
          },
          shippingAddress: { $ref: '#/components/schemas/ShippingAddress' },
          paymentMethod: { type: 'string', enum: ['cod', 'stripe'], example: 'stripe' },
          paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed', 'refunded'], example: 'paid' },
          paymentResult: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              update_time: { type: 'string' },
              email_address: { type: 'string' },
            },
          },
          taxPrice: { type: 'number', example: 10 },
          shippingPrice: { type: 'number', example: 5 },
          totalPrice: { type: 'number', example: 115 },
          orderStatus: { 
            type: 'string', 
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            example: 'pending'
          },
          deliveredAt: { type: 'string', format: 'date-time' },
          isMasterOrder: { type: 'boolean', example: true },
          subOrders: { 
            type: 'array',
            items: { type: 'string' }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          product: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'Wireless Headphones' },
          quantity: { type: 'number', example: 2 },
          price: { type: 'number', example: 99.99 },
          image: { type: 'string', example: 'https://example.com/image.jpg' },
          seller: { type: 'string', example: '507f1f77bcf86cd799439012' },
        },
      },
      ShippingAddress: {
        type: 'object',
        properties: {
          street: { type: 'string', example: '123 Main St' },
          city: { type: 'string', example: 'New York' },
          state: { type: 'string', example: 'NY' },
          zipCode: { type: 'string', example: '10001' },
          country: { type: 'string', example: 'USA' },
          phone: { type: 'string', example: '+1234567890' },
        },
        required: ['street', 'city', 'state', 'zipCode', 'country', 'phone'],
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'Electronics' },
          slug: { type: 'string', example: 'electronics' },
          description: { type: 'string', example: 'Electronic devices and accessories' },
          isActive: { type: 'boolean', example: true },
          iconSvg: { type: 'string', example: '<svg>...</svg>' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      SubOrder: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          masterOrder: { type: 'string', example: '507f1f77bcf86cd799439012' },
          seller: { type: 'string', example: '507f1f77bcf86cd799439013' },
          buyer: { type: 'string', example: '507f1f77bcf86cd799439014' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' }
          },
          subtotal: { type: 'number', example: 199.98 },
          platformCommission: { type: 'number', example: 19.99 },
          sellerEarnings: { type: 'number', example: 179.99 },
          status: { 
            type: 'string', 
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            example: 'pending'
          },
          sellerApproved: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
          data: { type: 'object' },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication token is missing or invalid',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Not authorized, token missing or invalid',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'User does not have permission to access this resource',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Access denied. Insufficient permissions.',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Resource not found',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              message: 'Validation failed',
              errors: ['Field is required', 'Invalid email format'],
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and profile management endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints (Admin only)',
    },
    {
      name: 'Products',
      description: 'Product management and browsing endpoints',
    },
    {
      name: 'Categories',
      description: 'Category management endpoints',
    },
    {
      name: 'Orders',
      description: 'Order management endpoints',
    },
    {
      name: 'Sub-Orders',
      description: 'Seller-specific order management endpoints',
    },
    {
      name: 'Payment',
      description: 'Payment processing endpoints (Stripe integration)',
    },
    {
      name: 'Health',
      description: 'API health check endpoints',
    },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: [
    './src/app/main/routes/*.ts',
    './src/app/main/controllers/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
