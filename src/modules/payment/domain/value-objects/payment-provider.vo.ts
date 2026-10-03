import {
  PAYMENT_PROVIDERS,
  PaymentProviderName,
} from '../constants/payment.constants.js';
import { UnsupportedPaymentProviderException } from '../exceptions/payment-gateway.exception.js';

export class PaymentProvider {
  private constructor(private readonly _value: PaymentProviderName) {}

  static create(value: string): PaymentProvider {
    const normalized = value.trim().toLowerCase();

    if (!PaymentProvider.isProviderName(normalized)) {
      throw new UnsupportedPaymentProviderException(value);
    }

    return new PaymentProvider(normalized as PaymentProviderName);
  }

  get value(): PaymentProviderName {
    return this._value;
  }

  equals(other: PaymentProvider): boolean {
    return this._value === other._value;
  }

  private static isProviderName(value: string): value is PaymentProviderName {
    return (Object.values(PAYMENT_PROVIDERS) as readonly string[]).includes(
      value,
    );
  }
}
