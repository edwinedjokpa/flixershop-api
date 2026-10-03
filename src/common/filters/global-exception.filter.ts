import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import { createApiErrorResponse } from '@/common/utils/api-response.util.js';
import {
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from '@/common/interfaces/api-response.interface.js';
import { DomainException } from '@/shared/domain/exceptions/domain.exception.js';
import {
  ApplicationException,
  ApplicationExceptionStatus,
} from '@/shared/domain/exceptions/application.exception.js';

interface HttpExceptionResponse {
  code?: unknown;
  message?: unknown;
  details?: unknown;
  errors?: Record<string, string[]>;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ApplicationException) {
      const status = this.getApplicationExceptionStatus(exception.status);
      response.status(status).json(
        createApiErrorResponse({
          statusCode: status,
          code: exception.code,
          message: exception.message,
          details: exception.details,
        }),
      );

      return;
    }

    if (exception instanceof DomainException) {
      response.status(HttpStatus.BAD_REQUEST).json(
        createApiErrorResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          code: exception.code,
          message: exception.message,
          details: exception.details,
        }),
      );

      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      response
        .status(status)
        .json(this.formatHttpException(exceptionResponse, status));

      return;
    }

    this.logger.error(exception);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiErrorResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
      }),
    );
  }

  private formatHttpException(
    exceptionResponse: string | object,
    status: number,
  ): ApiErrorResponse | ApiValidationErrorResponse {
    if (typeof exceptionResponse === 'string') {
      return createApiErrorResponse({
        statusCode: status,
        code: this.getDefaultCode(status),
        message: exceptionResponse,
      });
    }

    const { code, message, details, errors } =
      exceptionResponse as HttpExceptionResponse;

    // Validation error
    if (errors !== undefined) {
      return {
        success: false,
        statusCode: status,
        error: {
          code: 'VALIDATION_FAILED',
          message: this.getMessage(message),
        },
        errors,
      };
    }

    // Normal HTTP exception
    return createApiErrorResponse({
      statusCode: status,
      code: typeof code === 'string' ? code : this.getDefaultCode(status),
      message: this.getMessage(message),
      details,
    });
  }

  private getMessage(message: unknown): string {
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return 'Validation failed';
    return 'An error occurred';
  }

  private getDefaultCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';

      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';

      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';

      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';

      case HttpStatus.CONFLICT:
        return 'CONFLICT';

      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';

      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';

      default:
        return 'HTTP_ERROR';
    }
  }

  private getApplicationExceptionStatus(
    status: ApplicationExceptionStatus,
  ): HttpStatus {
    switch (status) {
      case ApplicationExceptionStatus.VALIDATION_ERROR:
        return HttpStatus.BAD_REQUEST;

      case ApplicationExceptionStatus.BAD_REQUEST:
        return HttpStatus.BAD_REQUEST;

      case ApplicationExceptionStatus.BAD_GATEWAY:
        return HttpStatus.BAD_GATEWAY;

      case ApplicationExceptionStatus.NOT_FOUND:
        return HttpStatus.NOT_FOUND;

      case ApplicationExceptionStatus.CONFLICT:
        return HttpStatus.CONFLICT;

      case ApplicationExceptionStatus.INTERNAL_SERVER_ERROR:
        return HttpStatus.INTERNAL_SERVER_ERROR;

      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
