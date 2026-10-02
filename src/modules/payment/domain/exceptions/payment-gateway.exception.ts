import {
  ApplicationException,
  ApplicationExceptionStatus,
} from '@/shared/domain/exceptions/application.exception.js';

export class UnsupportedPaymentProviderException extends ApplicationException {
  constructor(provider: string) {
    super({
      code: 'UNSUPPORTED_PAYMENT_PROVIDER',
      message: `Unsupported payment provider: ${provider}`,
      status: ApplicationExceptionStatus.BAD_REQUEST,
    });
  }
}

export class PaymentGatewayNotConfiguredException extends ApplicationException {
  constructor(provider: string) {
    super({
      code: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
      message: `Payment gateway is not configured: ${provider}`,
      status: ApplicationExceptionStatus.INTERNAL_SERVER_ERROR,
    });
  }
}

export class InvalidPaymentWebhookException extends ApplicationException {
  constructor(message: string) {
    super({
      code: 'INVALID_PAYMENT_WEBHOOK',
      message,
      status: ApplicationExceptionStatus.BAD_REQUEST,
    });
  }
}

export class PaymentGatewayException extends ApplicationException {
  constructor(message: string) {
    super({
      code: 'PAYMENT_GATEWAY_ERROR',
      message,
      status: ApplicationExceptionStatus.BAD_GATEWAY,
    });
  }
}
