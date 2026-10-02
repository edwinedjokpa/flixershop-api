import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import {
  ApplicationException,
  ApplicationExceptionStatus,
} from '@/shared/domain/exceptions/application.exception.js';
import { createApiErrorResponse } from '@/common/utils/api-response.util.js';

const STATUS_TO_HTTP: Record<ApplicationExceptionStatus, HttpStatus> = {
  [ApplicationExceptionStatus.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [ApplicationExceptionStatus.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ApplicationExceptionStatus.CONFLICT]: HttpStatus.CONFLICT,
  [ApplicationExceptionStatus.BAD_REQUEST]: HttpStatus.BAD_REQUEST,
  [ApplicationExceptionStatus.BAD_GATEWAY]: HttpStatus.BAD_GATEWAY,
  [ApplicationExceptionStatus.INTERNAL_SERVER_ERROR]:
    HttpStatus.INTERNAL_SERVER_ERROR,
};

@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter<ApplicationException> {
  catch(exception: ApplicationException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      STATUS_TO_HTTP[exception.status] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json(
      createApiErrorResponse({
        statusCode: status,
        code: exception.code,
        message: exception.message,
        details: exception.details,
      }),
    );
  }
}
