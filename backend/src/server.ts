import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './config/database';
import { AppRoutes } from './app/routes';
import { ErrorMiddleware } from './app/middlewares/error.middleware';

// Load environment variables
dotenv.config();

class Server {
  private app: Application;
  private port: number;
  private database: Database;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000', 10);
    this.database = Database.getInstance();
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // CORS configuration
    this.app.use(
      cors({
        origin: [
          process.env.FRONTEND_URL || 'http://localhost:4200',
          process.env.ADMIN_URL || 'http://localhost:4201'
        ],
        credentials: true
      })
    );

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging in development
    if (process.env.NODE_ENV === 'development') {
      this.app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
      });
    }
  }

  private initializeRoutes(): void {
    const appRoutes = new AppRoutes();
    this.app.use('/api', appRoutes.router);

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'E-commerce API Server',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          auth: '/api/auth',
          users: '/api/users',
          products: '/api/products',
          orders: '/api/orders',
          payment: '/api/payment'
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(ErrorMiddleware.notFound);

    // Global error handler
    this.app.use(ErrorMiddleware.handle);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await this.database.connect();

      // Start server
      this.app.listen(this.port, () => {
        console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 E-commerce API Server is running!               ║
║                                                       ║
║   📡 Port: ${this.port}                                      ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                  ║
║   📚 API Docs: http://localhost:${this.port}/api/health      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
        `);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start();

export default server;
