import {
  ApplicationException,
  ApplicationExceptionStatus,
} from '@/shared/domain/exceptions/application.exception.js';
import { DomainException } from '@/shared/domain/exceptions/domain.exception.js';

interface ProductAlreadyExistsDetails {
  field: 'sku' | 'name';
  value: string;
}

export class InvalidSkuLength extends DomainException {
  constructor(min: number, max: number) {
    super({
      code: 'INVALID_SKU_LENGTH',
      message: `SKU must be between ${min} and ${max} characters.`,
    });
  }
}

export class InvalidSkuFormat extends DomainException {
  constructor() {
    super({
      code: 'INVALID_SKU_FORMAT',
      message: 'SKU must contain only alphanumeric characters and dashes.',
    });
  }
}

export class InvalidProductNameException extends DomainException {
  constructor() {
    super({
      code: 'INVALID_PRODUCT_NAME',
      message: `Product name must be at least 2 characters.`,
    });
  }
}

export class NegativeProductStockException extends DomainException {
  constructor() {
    super({
      code: 'NEGATIVE_PRODUCT_STOCK',
      message: 'Product stock cannot be negative.',
    });
  }
}

export class ProductNotFoundException extends ApplicationException {
  constructor(id: string) {
    super({
      code: 'PRODUCT_NOT_FOUND',
      message: `Product with ID ${id} not found.`,
      status: ApplicationExceptionStatus.NOT_FOUND,
    });
  }
}

export class ProductAlreadyExistsException extends ApplicationException<ProductAlreadyExistsDetails> {
  constructor(field: 'sku' | 'name', value: string) {
    super({
      code: 'PRODUCT_ALREADY_EXISTS',
      message: `A product with this ${field} already exists.`,
      status: ApplicationExceptionStatus.CONFLICT,
      details: {
        field,
        value,
      },
    });
  }
}
