import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiOkResponse } from '../interfaces/api-response.interface.js';
import { createApiOkResponse } from '../utils/api-response.util.js';
import { API_MESSAGE_KEY } from '../decorators/api-message.decorator.js';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiOkResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiOkResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const message =
      this.reflector.get<string>(API_MESSAGE_KEY, context.getHandler()) ??
      'Request successful';

    return next.handle().pipe(
      map((data) => ({
        ...createApiOkResponse({
          message,
          data,
        }),
        statusCode: response.statusCode,
      })),
    );
  }
}
