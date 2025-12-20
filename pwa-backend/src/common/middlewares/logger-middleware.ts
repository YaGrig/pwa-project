import { NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `📨 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`,
    )
    next()
  }
}
