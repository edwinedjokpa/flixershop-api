import {
  ApplicationException,
  ApplicationExceptionStatus,
} from '@/shared/domain/exceptions/application.exception.js';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class CustomerIdRequiredException extends ApplicationException {
  constructor() {
    super({
      code: 'CUSTOMER_ID_REQUIRED',
      message: 'X-Customer-Id header is required',
      status: ApplicationExceptionStatus.BAD_REQUEST,
    });
  }
}

export const CustomerId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    const customerId = request.headers['x-customer-id'];
    if (!customerId || Array.isArray(customerId)) {
      throw new CustomerIdRequiredException();
    }

    return customerId;
  },
);
