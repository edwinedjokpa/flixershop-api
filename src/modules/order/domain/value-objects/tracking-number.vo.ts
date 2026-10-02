import { customAlphabet } from 'nanoid';
import {
  InvalidTrackingNumberException,
  TrackingNumberRequiredException,
} from '../exceptions/order.exception.js';

const generateId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 12);

export class TrackingNumber {
  private static readonly TRACKING_NUMBER_PATTERN = /^FLX-[A-HJ-NP-Z2-9]{12}$/;

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static generate(): TrackingNumber {
    return new TrackingNumber(`FLX-${generateId()}`);
  }

  static create(value: string): TrackingNumber {
    const normalized = value.trim();

    if (!normalized || normalized.length === 0) {
      throw new TrackingNumberRequiredException();
    }

    if (!TrackingNumber.TRACKING_NUMBER_PATTERN.test(normalized)) {
      throw new InvalidTrackingNumberException(value);
    }

    return new TrackingNumber(normalized);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}
