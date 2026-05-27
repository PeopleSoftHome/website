import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

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

    // 记录 500 级错误日志（含请求路径和堆栈）
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} => ${status} | ${Array.isArray(message) ? message.join(', ') : message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

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
