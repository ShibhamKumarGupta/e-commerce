import express, { Application } from 'express';
import cors from 'cors';
import { DatabaseConfig } from '../config/database.config';
import { EnvironmentConfig } from '../config/environment.config';
import { AppRoutes } from './routes';
import { ErrorMiddleware } from '../middlewares/error.middleware';
import { LogUtils } from '../utils/log.utils';
import { OrderService } from '../services/order.service';

export class Server {
  private app: Application;
  private port: number;
  private database: DatabaseConfig;
  private scheduledJobsInitialized = false;
  private autoCancelTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.app = express();
    this.port = EnvironmentConfig.port;
    this.database = DatabaseConfig.getInstance();
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeScheduledJobs(): void {
    if (this.scheduledJobsInitialized) {
      return;
    }

  const rawThreshold = EnvironmentConfig.orderAutoCancelPendingMinutes;
  const rawInterval = EnvironmentConfig.orderAutoCancelCheckIntervalMinutes;

  const thresholdMinutes = Math.max(Number.isFinite(rawThreshold) ? rawThreshold : 30, 0);
  const checkIntervalMinutes = Math.max(Number.isFinite(rawInterval) ? rawInterval : 5, 1);

    if (thresholdMinutes === 0) {
      LogUtils.warn('[Scheduler] Stripe auto-cancel job disabled because threshold is set to 0 minutes.');
      this.scheduledJobsInitialized = true;
      return;
    }

    const orderService = new OrderService();
    const intervalMs = checkIntervalMinutes * 60 * 1000;

    const runJob = async () => {
      try {
        const result = await orderService.cancelStaleStripeOrders(thresholdMinutes);
        if (result.cancelled > 0) {
          LogUtils.info(`[#Scheduler] Auto-cancelled ${result.cancelled} Stripe order(s) pending longer than ${thresholdMinutes} minutes.`);
        } else if (result.totalCandidates > 0) {
          LogUtils.debug(`[#Scheduler] Checked ${result.totalCandidates} Stripe order(s); none required cancellation.`);
        } else {
          LogUtils.debug('[#Scheduler] No pending Stripe orders exceeded the threshold.');
        }
      } catch (error) {
        LogUtils.error('[#Scheduler] Stripe auto-cancel job failed', error);
      } finally {
        this.autoCancelTimeout = setTimeout(() => {
          void runJob();
        }, intervalMs);
      }
    };

    void runJob();
    this.scheduledJobsInitialized = true;

    LogUtils.info(
      `[#Scheduler] Stripe pending order auto-cancel scheduled. Threshold: ${thresholdMinutes} min, Check interval: ${checkIntervalMinutes} min.`
    );
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

      // Initialize background jobs
      this.initializeScheduledJobs();

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
