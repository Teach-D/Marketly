import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Request, Response } from 'express';
import type { Logger } from 'winston';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { method, url } = request;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      if (status >= 500) {
        this.logger.error('HTTP Error', { method, url, statusCode: status, error: body });
      } else if (status >= 400) {
        this.logger.warn('HTTP Warning', { method, url, statusCode: status, error: body });
      }

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

    this.logger.error('Unhandled Exception', {
      method,
      url,
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

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
