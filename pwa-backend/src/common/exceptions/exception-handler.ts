import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { CustomErrorResponse } from '../types/errors.types'

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
  path: string
  method: string
  statusCode: number
}

// types/error.types.ts

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response: Response = ctx.getResponse<Response>()
    const request: Request = ctx.getRequest<Request>()

    let status: number
    let message: string
    let code: string
    let details: string

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
        code = this.getErrorCode(status)
      } else {
        const responseObj = exceptionResponse as CustomErrorResponse
        message = responseObj.message || 'Unknown error'
        code = responseObj.code || this.getErrorCode(status)
        details = responseObj.details as string
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = 'Internal server error'
      code = 'INTERNAL_ERROR'

      if (process.env.NODE_ENV === 'development') {
        details =
          exception instanceof Error
            ? (exception.stack as string)
            : (exception as string)
      }
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
    }

    response.status(status).json(errorResponse)
  }
  private getErrorCode(status: number): string {
    const codes: { [key: number]: string } = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      500: 'INTERNAL_ERROR',
    }

    return codes[status] || 'UNKNOWN_ERROR'
  }
}
