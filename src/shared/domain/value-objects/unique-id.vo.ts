import { v7 as uuidv7 } from 'uuid';

export class UniqueId {
  private readonly _value: string;

  constructor(value?: string) {
    this._value = value ?? uuidv7();
  }

  equals(other: UniqueId): boolean {
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
