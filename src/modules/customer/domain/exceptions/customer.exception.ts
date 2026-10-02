import {
  ApplicationException,
  ApplicationExceptionStatus,
} from '@/shared/domain/exceptions/application.exception.js';
import { DomainException } from '@/shared/domain/exceptions/domain.exception.js';

export class EmailCannotBeEmptyException extends DomainException {
  constructor() {
    super({
      code: 'EMAIL_CANNOT_BE_EMPTY',
      message: 'Email cannot be empty.',
    });
  }
}

export class EmailInvalidFormatException extends DomainException {
  constructor() {
    super({
      code: 'EMAIL_INVALID_FORMAT',
      message: 'Invalid email format.',
    });
  }
}

export class CustomerNotFoundException extends ApplicationException {
  constructor(id: string) {
    super({
      code: 'CUSTOMER_NOT_FOUND',
      message: `Customer with ID ${id} not found.`,
      status: ApplicationExceptionStatus.NOT_FOUND,
    });
  }
}

export class CustomerAlreadyExistsException extends ApplicationException {
  constructor(email: string) {
    super({
      code: 'CUSTOMER_ALREADY_EXISTS',
      message: `A customer with this email: ${email} already exists.`,
      status: ApplicationExceptionStatus.CONFLICT,
    });
  }
}
