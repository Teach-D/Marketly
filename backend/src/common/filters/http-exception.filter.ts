import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'object' && body !== null && 'success' in body) {
        response.status(status).json(body);
        return;
      }

      response.status(status).json({
        success: false,
        data: null,
        error: {
          code: 'HTTP_EXCEPTION',
          message: typeof body === 'string' ? body : (body as { message: string }).message,
        },
      });
      return;
    }

    this.logger.error(`Unhandled exception on ${request.method} ${request.url}`, exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      data: null,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '서버 오류가 발생했습니다.',
      },
    });
  }
}
