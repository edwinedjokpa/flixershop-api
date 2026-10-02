import {
  ApplicationException,
  ApplicationExceptionStatus,
} from '@/shared/domain/exceptions/application.exception.js';
import { DomainException } from '@/shared/domain/exceptions/domain.exception.js';

interface InvalidPaymentStatusTransitionExceptionDetails {
  current: string;
  target: string;
}

export class InvalidPaymentStatusException extends DomainException {
  constructor(value: string) {
    super({
      code: 'INVALID_PAYMENT_STATUS',
      message: `Invalid payment status: ${value}`,
    });
  }
}

export class InvalidPaymentStatusTransitionException extends DomainException<InvalidPaymentStatusTransitionExceptionDetails> {
  constructor(details: InvalidPaymentStatusTransitionExceptionDetails) {
    super({
      code: 'INVALID_PAYMENT_STATUS_TRANSITION',
      message: `Cannot transition to ${details.target} from ${details.current}.`,
      details,
    });
  }
}

export class InvalidPaymentAmountException extends DomainException {
  constructor(amount: number) {
    super({
      code: 'INVALID_PAYMENT_AMOUNT',
      message: 'Payment amount must be greater than 0',
      details: { amount },
    });
  }
}

export class CheckoutNotAllowedException extends DomainException {
  constructor(status: string) {
    super({
      code: 'CHECKOUT_NOT_ALLOWED',
      message: `Cannot start checkout for a payment in ${status} status`,
      details: { status },
    });
  }
}

export class PaymentNotFoundException extends ApplicationException {
  constructor(id: string) {
    super({
      code: 'PAYMENT_NOT_FOUND',
      message: `Payment with ID ${id} not found.`,
      status: ApplicationExceptionStatus.NOT_FOUND,
    });
  }
}

export class OrderPricingNotFoundException extends ApplicationException {
  constructor(orderId: string) {
    super({
      code: 'ORDER_PRICING_NOT_FOUND',
      message: `Pricing for order with ID ${orderId} not found.`,
      status: ApplicationExceptionStatus.NOT_FOUND,
      details: { orderId },
    });
  }
}

export class OrderAlreadyPaidException extends ApplicationException {
  constructor(orderId: string) {
    super({
      code: 'ORDER_ALREADY_PAID',
      message: `Order with ID ${orderId} has already been paid.`,
      status: ApplicationExceptionStatus.CONFLICT,
    });
  }
}

export class PaymentCustomerNotFoundException extends ApplicationException {
  constructor() {
    super({
      code: 'PAYMENT_CUSTOMER_NOT_FOUND',
      message: 'Customer for payment could not be found',
      status: ApplicationExceptionStatus.NOT_FOUND,
    });
  }
}
