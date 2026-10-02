import { AggregateRoot } from '@/shared/domain/aggregate-root.js';
import { OrderId } from '../value-objects/order-id.vo.js';
import { OrderStatus } from '../value-objects/order-status.vo.js';
import { ShippingAddress } from '../value-objects/shipping-address.vo.js';
import { OrderItem } from './order-item.entity.js';
import {
  CancellationReasonRequiredException,
  EmptyOrderException,
} from '../exceptions/order.exception.js';
import { OrderPlacedEvent } from '../events/order-placed.event.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { OrderConfirmedEvent } from '../events/order-confirmed.event.js';
import { OrderShippedEvent } from '../events/order-shipped.event.js';
import { OrderDeliveredEvent } from '../events/order-delivered.event.js';
import { OrderCancelledEvent } from '../events/order-cancelled.event.js';
import { TrackingNumber } from '../value-objects/tracking-number.vo.js';
import { Currency } from '@/shared/domain/value-objects/currency.vo.js';

interface OrderProps {
  id: OrderId;
  customerId: string;
  currency: Currency;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  trackingNumber: TrackingNumber | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateOrderProps {
  customerId: string;
  currency: Currency;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  notes?: string | null;
}

export class Order extends AggregateRoot {
  private readonly _id: OrderId;
  private readonly _customerId: string;
  private readonly _currency: Currency;
  private _status: OrderStatus;
  private _items: OrderItem[];
  private readonly _shippingAddress: ShippingAddress;
  private _trackingNumber: TrackingNumber | null;
  private _notes: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: OrderProps) {
    super();
    this._id = props.id;
    this._customerId = props.customerId;
    this._currency = props.currency;
    this._status = props.status;
    this._items = props.items;
    this._shippingAddress = props.shippingAddress;
    this._trackingNumber = props.trackingNumber;
    this._notes = props.notes;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static place({
    customerId,
    currency,
    items,
    shippingAddress,
    notes,
  }: CreateOrderProps) {
    if (items.length === 0) {
      throw new EmptyOrderException();
    }

    const now = new Date();
    const orderId = new OrderId();

    const order = new Order({
      id: orderId,
      customerId,
      currency,
      status: OrderStatus.pending(),
      items,
      shippingAddress,
      trackingNumber: null,
      notes: notes ?? null,
      createdAt: now,
      updatedAt: now,
    });

    order.apply(new OrderPlacedEvent({ orderId: orderId.value, customerId }));

    return order;
  }

  static reconstitute(props: OrderProps): Order {
    return new Order(props);
  }

  confirm(): void {
    this._status = this._status.confirm();
    this._updatedAt = new Date();

    this.apply(
      new OrderConfirmedEvent({
        orderId: this._id.value,
        customerId: this._customerId,
        shippingAddress: {
          street: this._shippingAddress.street,
          city: this._shippingAddress.city,
          state: this._shippingAddress.state,
          zipCode: this._shippingAddress.zipCode,
          country: this._shippingAddress.country,
        },
      }),
    );
  }

  ship(): void {
    const trackingNumber = TrackingNumber.generate();

    this._status = this._status.ship();
    this._trackingNumber = trackingNumber;
    this._updatedAt = new Date();

    this.apply(
      new OrderShippedEvent({
        orderId: this._id.value,
        customerId: this._customerId,
        trackingNumber: trackingNumber.value,
      }),
    );
  }

  deliver() {
    this._status = this._status.deliver();
    this._updatedAt = new Date();

    this.apply(
      new OrderDeliveredEvent({
        orderId: this._id.value,
        customerId: this._customerId,
      }),
    );
  }

  cancel(reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new CancellationReasonRequiredException();
    }

    this._status = this._status.cancel();
    this._updatedAt = new Date();

    this.apply(
      new OrderCancelledEvent({
        orderId: this._id.value,
        customerId: this._customerId,
      }),
    );
  }

  get id(): OrderId {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get currency(): Currency {
    return this._currency;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get items(): ReadonlyArray<OrderItem> {
    return this._items;
  }

  get shippingAddress(): ShippingAddress {
    return this._shippingAddress;
  }

  get trackingNumber(): TrackingNumber | null {
    return this._trackingNumber;
  }

  get notes(): string | null {
    return this._notes;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get itemCount(): number {
    return this._items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get total(): Money {
    return this.subtotal;
  }

  get subtotal(): Money {
    if (this._items.length === 0) {
      return Money.zero(this._currency.value);
    }
    return this._items.reduce(
      (sum, item) => sum.add(item.getSubtotal()),
      Money.zero(this._currency.value),
    );
  }
}
