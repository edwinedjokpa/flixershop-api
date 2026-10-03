import { Decimal } from 'decimal.js';

import {
  InvalidMoneyMultiplierException,
  NegativeAmountException,
} from '../exceptions/money.exception.js';
import { Currency } from './currency.vo.js';
import { CurrencyMismatchException } from '../exceptions/currency.exception.js';

export class Money {
  private readonly _amount: Decimal;
  private readonly _currency: Currency;

  private constructor(amount: Decimal, currency: Currency) {
    this._amount = amount;
    this._currency = currency;
  }

  static create(amount: string | number, currency: string): Money {
    const decimalAmount = new Decimal(amount);

    if (decimalAmount.isNegative()) {
      throw new NegativeAmountException();
    }

    return new Money(decimalAmount, Currency.create(currency));
  }

  static zero(currency: string): Money {
    return new Money(new Decimal(0), Currency.create(currency));
  }

  static fromMinorUnits(
    units: bigint | string | number,
    currency: string,
  ): Money {
    const cur = Currency.create(currency);
    return new Money(
      new Decimal(units.toString()).div(cur.minorUnitMultiplier.toString()),
      cur,
    );
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount.plus(other._amount), this._currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);

    const result = this._amount.minus(other._amount);
    if (result.isNegative()) {
      throw new NegativeAmountException();
    }

    return new Money(result, this._currency);
  }

  multiply(factor: number): Money {
    const f = new Decimal(factor);
    if (f.isNegative()) {
      throw new InvalidMoneyMultiplierException(Number(factor));
    }

    return new Money(this._amount.mul(f), this._currency);
  }

  divide(divisor: number): Money {
    const d = new Decimal(divisor);
    if (d.isNegative()) {
      throw new InvalidMoneyMultiplierException(Number(divisor));
    }

    return new Money(this._amount.div(d), this._currency);
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount.greaterThan(other._amount);
  }

  isGreaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount.greaterThanOrEqualTo(other._amount);
  }

  equals(other: Money): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    return (
      this._amount.equals(other._amount) && this._currency === other._currency
    );
  }

  toMinorUnits(): bigint {
    return BigInt(
      this._amount
        .mul(this._currency.minorUnitMultiplier.toString())
        .toFixed(0),
    );
  }

  formatAmount(): string {
    const value = this._amount.toFixed(this._currency.decimalDigits);
    const [integerPart, fractionalPart] = value.split('.');

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return fractionalPart
      ? `${formattedInteger}.${fractionalPart}`
      : formattedInteger;
  }

  toString(): string {
    return `${this._amount.toFixed(2)} ${this._currency.value}`;
  }

  get amount(): Decimal {
    return this._amount;
  }

  get currency(): Currency {
    return this._currency;
  }

  private assertSameCurrency(other: Money): void {
    if (!this._currency.equals(other._currency)) {
      throw new CurrencyMismatchException({
        expected: this._currency.value,
        actual: other._currency.value,
      });
    }
  }
}
