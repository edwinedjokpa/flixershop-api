import {
  CURRENCIES,
  CurrencyMetadata,
} from '../constants/currency.constants.js';
import {
  InvalidCurrencyException,
  UnsupportedCurrencyException,
} from '../exceptions/currency.exception.js';

export class Currency {
  private static readonly CURRENCY_REGEX = /^[A-Z]{3}$/;

  private constructor(
    private readonly _value: string,
    private readonly _metadata: CurrencyMetadata,
  ) {}

  static create(value: string): Currency {
    const normalized = value.trim().toUpperCase();

    const metadata = CURRENCIES[normalized];
    if (metadata.decimalDigits === undefined) {
      throw new UnsupportedCurrencyException(normalized);
    }

    if (!this.CURRENCY_REGEX.test(normalized)) {
      throw new InvalidCurrencyException(value);
    }

    return new Currency(normalized, metadata);
  }

  get value(): string {
    return this._value;
  }

  get name(): string {
    return this._metadata.name;
  }

  get symbol(): string {
    return this._metadata.symbol;
  }

  get displaySymbol(): string {
    return this._metadata.displaySymbol;
  }

  get decimalDigits(): number {
    return this._metadata.decimalDigits;
  }

  get minorUnitMultiplier(): bigint {
    return 10n ** BigInt(this._metadata.decimalDigits);
  }

  equals(other: Currency): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
