import {
  ApplicationException,
  ApplicationExceptionStatus,
} from './application.exception.js';
import { DomainException } from './domain.exception.js';

interface CurrencyMismatchExceptionDetails {
  expected: string;
  actual: string;
}

interface CurrencyExchangeApiExceptionDetails {
  from: string;
  to: string;
  statusCode: number;
}

interface CurrencyExchangeProviderExceptionDetails {
  from: string;
  to: string;
  errorType: string;
}

export class UnsupportedCurrencyException extends DomainException {
  constructor(value: string) {
    super({
      code: 'UNSUPPORTED_CURRENCY',
      message: `Unsupported currency: ${value}.`,
      details: {
        value,
      },
    });
  }
}
export class InvalidCurrencyException extends DomainException {
  constructor(value: string) {
    super({
      code: 'INVALID_CURRENCY',
      message: `Invalid currency value: ${value}.`,
      details: {
        value,
      },
    });
  }
}

export class CurrencyMismatchException extends DomainException<CurrencyMismatchExceptionDetails> {
  constructor(details: CurrencyMismatchExceptionDetails) {
    super({
      code: 'CURRENCY_MISMATCH',
      message: 'The currencies do not match.',
      details,
    });
  }
}

export class CurrencyExchangeApiException extends ApplicationException<CurrencyExchangeApiExceptionDetails> {
  constructor(details: CurrencyExchangeApiExceptionDetails) {
    super({
      code: 'CURRENCY_EXCHANGE_API_ERROR',
      message: 'The currency exchange provider request failed.',
      status: ApplicationExceptionStatus.BAD_GATEWAY,
      details,
    });
  }
}

export class CurrencyExchangeProviderException extends ApplicationException<CurrencyExchangeProviderExceptionDetails> {
  constructor(details: CurrencyExchangeProviderExceptionDetails) {
    super({
      code: 'CURRENCY_EXCHANGE_PROVIDER_ERROR',
      message:
        'The currency exchange provider could not perform the conversion.',
      status: ApplicationExceptionStatus.BAD_GATEWAY,
      details,
    });
  }
}
