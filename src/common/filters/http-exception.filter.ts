import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      
      // Xử lý response từ HttpException
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        // Giữ nguyên message dạng array hoặc string từ validation
        message = (res as any).message || message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error với format phù hợp
    const logMessage = Array.isArray(message) ? message.join(', ') : message;
    this.logger.error(`[${status}] ${logMessage}`, exception instanceof Error ? exception.stack : '');

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp,
    });
  }
}
