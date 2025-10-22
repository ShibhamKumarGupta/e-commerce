export const developmentConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || '',
    options: {
      retryWrites: true,
      w: 'majority'
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  },
  cors: {
    origins: [
      process.env.FRONTEND_URL || 'http://localhost:4200',
      process.env.ADMIN_URL || 'http://localhost:4201'
    ],
    credentials: true
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  }
};
