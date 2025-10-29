import { developmentConfig } from './environments/development.env';
import { productionConfig } from './environments/production.env';

const env = process.env.NODE_ENV || 'development';

export const config = env === 'production' ? productionConfig : developmentConfig;

export class EnvironmentConfig {
  static get port(): number {
    return config.port;
  }

  static get nodeEnv(): string {
    return config.nodeEnv;
  }

  static get mongodbUri(): string {
    return config.mongodb.uri;
  }

  static get jwtSecret(): string {
    return config.jwt.secret;
  }

  static get jwtExpiresIn(): string {
    return config.jwt.expiresIn;
  }

  static get corsOrigins(): string[] {
    return config.cors.origins;
  }

  static get stripeSecretKey(): string {
    return config.stripe.secretKey;
  }

  static get stripePublishableKey(): string {
    return config.stripe.publishableKey;
  }

  static get cloudinaryConfig() {
    return config.cloudinary;
  }

  static get isDevelopment(): boolean {
    return config.nodeEnv === 'development';
  }

  static get isProduction(): boolean {
    return config.nodeEnv === 'production';
  }

  static get orderAutoCancelPendingMinutes(): number {
    return config.order?.autoCancelPendingMinutes ?? 30;
  }

  static get orderAutoCancelCheckIntervalMinutes(): number {
    return config.order?.autoCancelCheckIntervalMinutes ?? 5;
  }
}
