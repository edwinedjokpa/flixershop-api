import { AggregateRoot } from '@nestjs/cqrs';
import { PaymentId } from '../value-objects/payment-id.vo.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { PaymentStatus } from '../value-objects/payment-status.vo.js';
import {
  CheckoutNotAllowedException,
  InvalidPaymentAmountException,
} from '../exceptions/payment.exception.js';
import { PaymentCompletedEvent } from '../event/payment-completed.event.js';
import { PaymentProvider } from '../value-objects/payment-provider.vo.js';

export interface PaymentProps {
  id: PaymentId;
  orderId: string;
  money: Money;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerTransactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface InitiatePaymentProps {
  orderId: string;
  money: Money;
  provider: string;
}

export class Payment extends AggregateRoot {
  private _id: PaymentId;
  private _orderId: string;
  private _money: Money;
  private _status: PaymentStatus;
  private _provider: PaymentProvider;
  private _providerTransactionId: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: PaymentProps) {
    super();
    this._id = props.id;
    this._orderId = props.orderId;
    this._money = props.money;
    this._status = props.status;
    this._provider = props.provider;
    this._providerTransactionId = props.providerTransactionId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static initiate({ orderId, money, provider }: InitiatePaymentProps): Payment {
    if (money.amount.isNegative()) {
      throw new InvalidPaymentAmountException(Number(money.amount.toString()));
    }

    const now = new Date();
    return new Payment({
      id: new PaymentId(),
      orderId,
      money,
      status: PaymentStatus.pending(),
      provider: PaymentProvider.create(provider),
      providerTransactionId: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  complete(providerTransactionId: string) {
    this._providerTransactionId = providerTransactionId;
    this._status = this._status.transitionToSucceeded();
    this._updatedAt = new Date();

    this.apply(
      new PaymentCompletedEvent({
        paymentId: this._id.value,
        orderId: this._orderId,
        providerTransactionId: this._providerTransactionId,
      }),
    );
  }

  static reconstitute(props: PaymentProps): Payment {
    return new Payment(props);
  }

  startCheckout() {
    if (this.isSucceeded()) {
      throw new CheckoutNotAllowedException(this._status.value);
    }

    this._status = PaymentStatus.processing();
    this._updatedAt = new Date();
  }

  isSucceeded(): boolean {
    return this._status.isSucceeded();
  }

  get id(): PaymentId {
    return this._id;
  }

  get orderId(): string {
    return this._orderId;
  }

  get money(): Money {
    return this._money;
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get provider(): PaymentProvider {
    return this._provider;
  }

  get providerTransactionId(): string | null {
    return this._providerTransactionId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
