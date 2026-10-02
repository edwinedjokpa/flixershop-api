import {
  InvalidSkuFormat,
  InvalidSkuLength,
} from '../exceptions/product.exception.js';

export class Sku {
  private static readonly SKU_PATTERN = /^[A-Za-z0-9-]+$/;
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 50;

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): Sku {
    const trimmed = value.trim();

    if (trimmed.length < Sku.MIN_LENGTH || trimmed.length > Sku.MAX_LENGTH) {
      throw new InvalidSkuLength(Sku.MIN_LENGTH, Sku.MAX_LENGTH);
    }

    if (!Sku.SKU_PATTERN.test(trimmed)) {
      throw new InvalidSkuFormat();
    }

    return new Sku(trimmed.toUpperCase());
  }

  equals(other: Sku): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  get value(): string {
    return this._value;
  }
}
