import {
  ORDER_STATUSES,
  OrderStatusName,
} from '../constants/order.constants.js';
import {
  InvalidOrderStatusException,
  InvalidOrderStatusTransitionException,
} from '../exceptions/order.exception.js';

export class OrderStatus {
  private static readonly VALID_TRANSITIONS: Record<
    OrderStatusName,
    OrderStatusName[]
  > = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  private readonly _value: OrderStatusName;

  private constructor(value: OrderStatusName) {
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
    if (!OrderStatus.isStatusName(value)) {
      throw new InvalidOrderStatusException(value);
    }
    return new OrderStatus(value);
  }

  private static isStatusName(value: string): value is OrderStatusName {
    return (Object.values(ORDER_STATUSES) as readonly string[]).includes(value);
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

  get value(): OrderStatusName {
    return this._value;
  }

  private canTransitionTo(target: OrderStatusName): boolean {
    const allowed = OrderStatus.VALID_TRANSITIONS[this.value];
    return allowed.includes(target);
  }

  private transitionTo(target: OrderStatusName): OrderStatus {
    if (!this.canTransitionTo(target)) {
      throw new InvalidOrderStatusTransitionException({
        currentStatus: this.value,
        targetStatus: target,
      });
    }

    return new OrderStatus(target);
  }
}
