import {
  InvalidOrderStatusException,
  InvalidOrderStatusTransitionException,
} from '../exceptions/order.exception.js';

export const OrderStatusValue = {
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
} as const;

export type OrderStatusValue =
  (typeof OrderStatusValue)[keyof typeof OrderStatusValue];

export class OrderStatus {
  private static readonly VALID_TRANSITIONS: Record<
    OrderStatusValue,
    OrderStatusValue[]
  > = {
    [OrderStatusValue.PENDING]: [
      OrderStatusValue.CONFIRMED,
      OrderStatusValue.CANCELLED,
    ],
    [OrderStatusValue.CONFIRMED]: [
      OrderStatusValue.SHIPPED,
      OrderStatusValue.CANCELLED,
    ],
    [OrderStatusValue.SHIPPED]: [OrderStatusValue.DELIVERED],
    [OrderStatusValue.DELIVERED]: [],
    [OrderStatusValue.CANCELLED]: [],
  };

  private readonly _value: OrderStatusValue;

  private constructor(value: OrderStatusValue) {
    this._value = value;
  }

  static pending(): OrderStatus {
    return new OrderStatus('pending');
  }

  static confirmed(): OrderStatus {
    return new OrderStatus('confirmed');
  }

  static shipped(): OrderStatus {
    return new OrderStatus('shipped');
  }

  static delivered(): OrderStatus {
    return new OrderStatus('delivered');
  }

  static cancelled(): OrderStatus {
    return new OrderStatus('cancelled');
  }

  static fromString(value: string): OrderStatus {
    const valid: OrderStatusValue[] = [
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!valid.includes(value as OrderStatusValue)) {
      throw new InvalidOrderStatusException(value);
    }

    return new OrderStatus(value as OrderStatusValue);
  }

  canConfirm(): boolean {
    return this.canTransitionTo('confirmed');
  }

  canShip(): boolean {
    return this.canTransitionTo('shipped');
  }

  canDeliver(): boolean {
    return this.canTransitionTo('delivered');
  }

  canCancel(): boolean {
    return this.canTransitionTo('cancelled');
  }

  confirm(): OrderStatus {
    return this.transitionTo('confirmed');
  }

  ship(): OrderStatus {
    return this.transitionTo('shipped');
  }

  deliver(): OrderStatus {
    return this.transitionTo('delivered');
  }

  cancel(): OrderStatus {
    return this.transitionTo('cancelled');
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  get value(): OrderStatusValue {
    return this._value;
  }

  private canTransitionTo(target: OrderStatusValue): boolean {
    const allowed = OrderStatus.VALID_TRANSITIONS[this.value];
    return allowed.includes(target);
  }

  private transitionTo(target: OrderStatusValue): OrderStatus {
    if (!this.canTransitionTo(target)) {
      throw new InvalidOrderStatusTransitionException({
        currentStatus: this.value,
        targetStatus: target,
      });
    }

    return new OrderStatus(target);
  }
}
