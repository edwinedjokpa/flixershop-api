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
  amount: Money;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerTransactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface InitiatePaymentProps {
  orderId: string;
  amount: Money;
  provider: string;
}

export class Payment extends AggregateRoot {
  private _id: PaymentId;
  private _orderId: string;
  private _amount: Money;
  private _status: PaymentStatus;
  private _provider: PaymentProvider;
  private _providerTransactionId: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: PaymentProps) {
    super();
    this._id = props.id;
    this._orderId = props.orderId;
    this._amount = props.amount;
    this._status = props.status;
    this._provider = props.provider;
    this._providerTransactionId = props.providerTransactionId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static initiate({
    orderId,
    amount,
    provider,
  }: InitiatePaymentProps): Payment {
    const parsedAmount = amount.amount.toNumber();
    if (parsedAmount <= 0) {
      throw new InvalidPaymentAmountException(parsedAmount);
    }

    const now = new Date();
    return new Payment({
      id: new PaymentId(),
      orderId,
      amount,
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

  get amount(): Money {
    return this._amount;
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
