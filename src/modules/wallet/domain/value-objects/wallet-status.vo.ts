import {
  WalletStatusName,
  WALLET_STATUSES,
} from '../constants/wallet.constants.js';
import {
  InvalidWalletStatusException,
  InvalidWalletStatusTransitionException,
} from '../exceptions/wallet.exception.js';

export class WalletStatus {
  private constructor(private readonly _value: WalletStatusName) {}

  static active(): WalletStatus {
    return new WalletStatus('active');
  }

  static frozen(): WalletStatus {
    return new WalletStatus('frozen');
  }

  static closed(): WalletStatus {
    return new WalletStatus('closed');
  }

  static fromString(value: string): WalletStatus {
    if (!WalletStatus.isStatusName(value)) {
      throw new InvalidWalletStatusException(value);
    }
    return new WalletStatus(value);
  }

  get value(): WalletStatusName {
    return this._value;
  }

  isActive(): boolean {
    return this._value === 'active';
  }

  isFrozen(): boolean {
    return this._value === 'frozen';
  }

  isClosed(): boolean {
    return this._value === 'closed';
  }

  /** Credits are allowed unless the wallet is closed. */
  canCredit(): boolean {
    return !this.isClosed();
  }

  /** Debits are only allowed on an active wallet. */
  canDebit(): boolean {
    return this.isActive();
  }

  transitionToFrozen(): WalletStatus {
    return this.transitionTo('frozen', ['active']);
  }

  unfreeze(): WalletStatus {
    return this.transitionTo('active', ['frozen']);
  }

  reopen(): WalletStatus {
    return this.transitionTo('active', ['closed']);
  }

  transitionToClosed(): WalletStatus {
    return this.transitionTo('closed', ['active', 'frozen']);
  }

  equals(other: WalletStatus): boolean {
    return this._value === other._value;
  }

  private static isStatusName(value: string): value is WalletStatusName {
    return (Object.values(WALLET_STATUSES) as readonly string[]).includes(
      value,
    );
  }

  private transitionTo(
    target: WalletStatusName,
    allowedFrom: readonly WalletStatusName[],
  ): WalletStatus {
    if (!allowedFrom.includes(this._value)) {
      throw new InvalidWalletStatusTransitionException({
        currentStatus: this._value,
        targetStatus: target,
      });
    }
    return new WalletStatus(target);
  }
}
