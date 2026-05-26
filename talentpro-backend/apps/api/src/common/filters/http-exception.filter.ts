import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'Internal server error';

    const errors =
      typeof exceptionResponse === 'object' && (exceptionResponse as any).message
        ? Array.isArray((exceptionResponse as any).message)
          ? (exceptionResponse as any).message
          : undefined
        : undefined;

    response.status(status).json({
      success: false,
      error: {
        code: HttpStatus[status] || 'UNKNOWN_ERROR',
        message: Array.isArray(message) ? message[0] : message,
        details: errors,
      },
    });
  }
}
