import {
  InvalidPaymentStatusException,
  InvalidPaymentStatusTransitionException,
} from '../exceptions/payment.exception.js';

export const PaymentStatusValue = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
} as const;

export type PaymentStatusValue =
  (typeof PaymentStatusValue)[keyof typeof PaymentStatusValue];

export class PaymentStatus {
  private readonly _value: PaymentStatusValue;

  private constructor(value: PaymentStatusValue) {
    this._value = value;
  }

  static pending(): PaymentStatus {
    return new PaymentStatus(PaymentStatusValue.PENDING);
  }

  static processing(): PaymentStatus {
    return new PaymentStatus(PaymentStatusValue.PROCESSING);
  }

  static succeeded(): PaymentStatus {
    return new PaymentStatus(PaymentStatusValue.SUCCEEDED);
  }

  static fromString(value: string): PaymentStatus {
    const status = Object.values(PaymentStatusValue).find((s) => s === value);
    if (!status) {
      throw new InvalidPaymentStatusException(value);
    }
    return new PaymentStatus(status);
  }

  isProcessing(): boolean {
    return this._value === PaymentStatusValue.PROCESSING;
  }

  transitionToSucceeded(): PaymentStatus {
    if (!this.isProcessing()) {
      throw new InvalidPaymentStatusTransitionException({
        current: this._value,
        target: PaymentStatusValue.SUCCEEDED,
      });
    }
    return PaymentStatus.succeeded();
  }

  isSucceeded(): boolean {
    return this._value === PaymentStatusValue.SUCCEEDED;
  }

  get value(): PaymentStatusValue {
    return this._value;
  }
}
