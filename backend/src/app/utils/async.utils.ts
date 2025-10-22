import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export class AsyncUtils {
  static wrap(fn: AsyncFunction) {
    return asyncHandler(fn);
  }

  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      await this.delay(delayMs);
      return this.retry(fn, retries - 1, delayMs);
    }
  }
}
