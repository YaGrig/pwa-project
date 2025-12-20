import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable, map } from 'rxjs'

interface StandardResponse {
  success: boolean
  data: any
  timestamp: string
  path: string
  method: string
  statusCode: number
  pagination?: any
}

export class ValidationResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse> {
    const httpContext = context.switchToHttp()
    const request: Request = httpContext.getRequest()
    const response: Response = httpContext.getResponse()

    return next.handle().pipe(
      map((data: StandardResponse) => {
        if (data == null || data?.success !== undefined) {
          return data
        }

        const baseResponse: StandardResponse = {
          success: true,
          data: data,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          statusCode: response.statusCode,
        }

        return baseResponse
      }),
    )
  }
}
