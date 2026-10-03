import {
  PAYMENT_STATUSES,
  PaymentStatusValue,
} from '../constants/payment.constants.js';
import {
  InvalidPaymentStatusException,
  InvalidPaymentStatusTransitionException,
} from '../exceptions/payment.exception.js';

export class PaymentStatus {
  private readonly _value: PaymentStatusValue;

  private constructor(value: PaymentStatusValue) {
    this._value = value;
  }

  static pending(): PaymentStatus {
    return new PaymentStatus('pending');
  }

  static processing(): PaymentStatus {
    return new PaymentStatus('processing');
  }

  static succeeded(): PaymentStatus {
    return new PaymentStatus('succeeded');
  }

  static fromString(value: string): PaymentStatus {
    const status = Object.values(PAYMENT_STATUSES).find((s) => s === value);
    if (!status) {
      throw new InvalidPaymentStatusException(value);
    }
    return new PaymentStatus(status);
  }

  isProcessing(): boolean {
    return this._value === 'processing';
  }

  transitionToSucceeded(): PaymentStatus {
    if (!this.isProcessing()) {
      throw new InvalidPaymentStatusTransitionException({
        current: this._value,
        target: 'succeeded',
      });
    }
    return PaymentStatus.succeeded();
  }

  isSucceeded(): boolean {
    return this._value === 'succeeded';
  }

  get value(): PaymentStatusValue {
    return this._value;
  }
}
