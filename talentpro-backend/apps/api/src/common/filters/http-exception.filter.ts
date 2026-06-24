import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

interface ExceptionResponse {
  message?: string | string[];
  [key: string]: unknown;
}

interface RequestWithId extends Request {
  requestId?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();
    const requestId = request.requestId;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const responseBody = typeof exceptionResponse === 'string'
      ? { message: exceptionResponse }
      : (exceptionResponse as ExceptionResponse);
    const message = responseBody.message || 'Internal server error';

    const errors =
      typeof exceptionResponse === 'object' && responseBody.message
        ? Array.isArray(responseBody.message)
          ? responseBody.message
          : undefined
        : undefined;

    // 记录 500 级错误日志（含请求路径和堆栈）
    if (status >= 500) {
      const safeMessage = Array.isArray(message)
        ? message.join(', ')
        : String(message);
      // 脱敏：移除可能包含的敏感信息
      const sanitized = safeMessage
        .replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]')
        .replace(/token[=:]\s*\S+/gi, 'token=[REDACTED]')
        .replace(/secret[=:]\s*\S+/gi, 'secret=[REDACTED]');
      this.logger.error(
        `[${request.method}] ${request.url} => ${status} | ${sanitized}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code: HttpStatus[status] || 'UNKNOWN_ERROR',
        message: Array.isArray(message) ? message[0] : message,
        details: errors,
        requestId,
      },
    });
  }
}
