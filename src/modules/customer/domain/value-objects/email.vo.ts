import {
  EmailCannotBeEmptyException,
  EmailInvalidFormatException,
} from '../exceptions/customer.exception.js';

export class Email {
  private static readonly EMAIL_PATTERN =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): Email {
    const trimmed = value.trim().toLowerCase();

    if (!trimmed) {
      throw new EmailCannotBeEmptyException();
    }

    if (!Email.EMAIL_PATTERN.test(trimmed)) {
      throw new EmailInvalidFormatException();
    }

    return new Email(trimmed);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  get value(): string {
    return this._value;
  }
}
