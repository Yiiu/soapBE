import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryExceptionFilter implements ExceptionFilter {
  public catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    Logger.error(exception);
    response
      .status(500)
      .json({
        statusCode: 500,
        timestamp: new Date().toISOString(),
        message: exception.message,
      });
  }
}
