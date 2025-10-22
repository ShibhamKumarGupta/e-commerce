import express, { Application } from 'express';
import cors from 'cors';
import { DatabaseConfig } from '../config/database.config';
import { EnvironmentConfig } from '../config/environment.config';
import { AppRoutes } from './routes';
import { ErrorMiddleware } from '../middlewares/error.middleware';
import { LogUtils } from '../utils/log.utils';

export class Server {
  private app: Application;
  private port: number;
  private database: DatabaseConfig;

  constructor() {
    this.app = express();
    this.port = EnvironmentConfig.port;
    this.database = DatabaseConfig.getInstance();
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // CORS configuration
    this.app.use(
      cors({
        origin: EnvironmentConfig.corsOrigins,
        credentials: true
      })
    );

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging in development
    if (EnvironmentConfig.isDevelopment) {
      this.app.use((req, res, next) => {
        LogUtils.request(req.method, req.path);
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
║   🌍 Environment: ${EnvironmentConfig.nodeEnv}                  ║
║   📚 API Docs: http://localhost:${this.port}/api/health      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
        `);
      });
    } catch (error) {
      LogUtils.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}
