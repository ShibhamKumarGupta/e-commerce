export class LogUtils {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  static info(message: string, ...args: any[]): void {
    console.log(`ℹ️  [INFO] ${message}`, ...args);
  }

  static error(message: string, error?: any): void {
    console.error(`❌ [ERROR] ${message}`, error);
    if (this.isDevelopment && error?.stack) {
      console.error(error.stack);
    }
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`⚠️  [WARN] ${message}`, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.debug(`🐛 [DEBUG] ${message}`, ...args);
    }
  }

  static success(message: string, ...args: any[]): void {
    console.log(`✅ [SUCCESS] ${message}`, ...args);
  }

  static request(method: string, path: string, statusCode?: number): void {
    if (this.isDevelopment) {
      const status = statusCode ? `[${statusCode}]` : '';
      console.log(`📡 ${method} ${path} ${status}`);
    }
  }

  static database(message: string, ...args: any[]): void {
    console.log(`💾 [DATABASE] ${message}`, ...args);
  }
}
