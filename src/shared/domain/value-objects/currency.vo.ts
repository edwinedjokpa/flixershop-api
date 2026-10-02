import { InvalidCurrencyException } from '../exceptions/currency.exception.js';

export class Currency {
  private static readonly CURRENCY_REGEX = /^[A-Z]{3}$/;

  private constructor(private readonly _value: string) {}

  static create(value: string): Currency {
    const normalized = value.trim().toUpperCase();

    if (!this.CURRENCY_REGEX.test(normalized)) {
      throw new InvalidCurrencyException(value);
    }

    return new Currency(normalized);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Currency): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
