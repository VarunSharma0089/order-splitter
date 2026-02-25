import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const ms     = Date.now() - start;
      const status = res.statusCode;
      const color  = status >= 500 ? '\x1b[31m'  // red
                   : status >= 400 ? '\x1b[33m'  // yellow
                   : '\x1b[32m';                  // green
      this.logger.log(`${color}${method} ${originalUrl} ${status} +${ms}ms\x1b[0m`);
    });
    next();
  }
}
