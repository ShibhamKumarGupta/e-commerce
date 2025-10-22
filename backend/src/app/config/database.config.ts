import mongoose from 'mongoose';
import { EnvironmentConfig } from './environment.config';
import { LogUtils } from '../utils/log.utils';

export class DatabaseConfig {
  private static instance: DatabaseConfig;

  private constructor() {}

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  public async connect(): Promise<void> {
    try {
      const mongoUri = EnvironmentConfig.mongodbUri;

      if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      await mongoose.connect(mongoUri);

      LogUtils.database('MongoDB connected successfully');

      mongoose.connection.on('error', (error) => {
        LogUtils.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        LogUtils.warn('MongoDB disconnected');
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        LogUtils.database('MongoDB connection closed due to app termination');
        process.exit(0);
      });
    } catch (error) {
      LogUtils.error('MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.connection.close();
    LogUtils.database('MongoDB connection closed');
  }

  public getConnection() {
    return mongoose.connection;
  }
}
