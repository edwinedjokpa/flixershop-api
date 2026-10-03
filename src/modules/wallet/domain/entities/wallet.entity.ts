import { AggregateRoot } from '@nestjs/cqrs';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { WalletId } from '../value-objects/wallet-id.vo.js';
import { WalletStatus } from '../value-objects/wallet-status.vo.js';
import {
  InsufficientWalletBalanceException,
  InvalidWalletAmountException,
  WalletNotEmptyException,
  WalletOperationNotAllowedException,
} from '../exceptions/wallet.exception.js';

export interface WalletProps {
  id: WalletId;
  customerId: string;
  balance: Money;
  status: WalletStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain rules
 * 1. A wallet belongs to exactly one customer and has exactly one currency,
 *    both fixed at creation. (Uniqueness of customerId + currency is enforced
 *    by a unique index in the repository.)
 * 2. The balance can never be negative.
 * 3. Credit and debit amounts must be greater than zero.
 * 4. Every amount must be in the wallet's currency (enforced by Money).
 * 5. Active:  credits and debits allowed.
 *    Frozen:  credits allowed, debits blocked.
 *    Closed:  nothing allowed, and the state is final.
 *    Allowed transitions live in WalletStatus.
 * 6. A wallet can only be closed when its balance is zero.
 * 7. The wallet holds the balance only. Transaction history lives in the
 *    Transaction aggregate.
 */
export class Wallet extends AggregateRoot {
  private readonly _id: WalletId;
  private readonly _customerId: string;
  private _balance: Money;
  private _status: WalletStatus;
  private readonly _version: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: WalletProps) {
    super();
    this._id = props.id;
    this._customerId = props.customerId;
    this._balance = props.balance;
    this._status = props.status;
    this._version = props.version;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static open(customerId: string, currency: string): Wallet {
    const now = new Date();
    return new Wallet({
      id: new WalletId(),
      customerId,
      balance: Money.zero(currency),
      status: WalletStatus.active(),
      version: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: WalletProps): Wallet {
    return new Wallet(props);
  }

  credit(amount: Money): void {
    if (!this._status.canCredit()) {
      throw new WalletOperationNotAllowedException({
        operation: 'credit',
        status: this._status.value,
      });
    }
    this.assertPositive(amount);

    this._balance = this._balance.add(amount);
    this.touch();
  }

  debit(amount: Money): void {
    if (!this._status.canDebit()) {
      throw new WalletOperationNotAllowedException({
        operation: 'debit',
        status: this._status.value,
      });
    }
    this.assertPositive(amount);

    if (!this._balance.isGreaterThanOrEqual(amount)) {
      throw new InsufficientWalletBalanceException({
        balance: this._balance,
        requested: amount,
      });
    }

    this._balance = this._balance.subtract(amount);
    this.touch();
  }

  canAfford(amount: Money): boolean {
    return (
      this._status.canDebit() && this._balance.isGreaterThanOrEqual(amount)
    );
  }

  freeze(): void {
    this._status = this._status.transitionToFrozen();
    this.touch();
  }

  unfreeze(): void {
    this._status = this._status.unfreeze();
    this.touch();
  }

  reopen(): void {
    this._status = this._status.reopen();
    this.touch();
  }

  close(): void {
    const next = this._status.transitionToClosed();

    if (!this._balance.amount.isZero()) {
      throw new WalletNotEmptyException(this._balance);
    }

    this._status = next;
    this.touch();
  }

  get id(): WalletId {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get balance(): Money {
    return this._balance;
  }

  get status(): WalletStatus {
    return this._status;
  }

  get version(): number {
    return this._version;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private assertPositive(amount: Money): void {
    if (amount.amount.lte(0)) {
      throw new InvalidWalletAmountException(amount);
    }
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
