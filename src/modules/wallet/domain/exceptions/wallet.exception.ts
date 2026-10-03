import {
  ApplicationException,
  ApplicationExceptionStatus,
} from '@/shared/domain/exceptions/application.exception.js';
import { DomainException } from '@/shared/domain/exceptions/domain.exception.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';

export class InvalidWalletStatusException extends DomainException {
  constructor(status: string) {
    super({
      code: 'INVALID_WALLET_STATUS',
      message: `Invalid wallet status: ${status}.`,
    });
  }
}

export class InvalidWalletStatusTransitionException extends DomainException {
  constructor(props: { currentStatus: string; targetStatus: string }) {
    super({
      code: 'INVALID_WALLET_STATUS_TRANSITION',
      message: `Invalid wallet status transition: cannot transition from ${props.currentStatus} to ${props.targetStatus}.`,
    });
  }
}

export class WalletOperationNotAllowedException extends DomainException {
  constructor(props: { operation: 'credit' | 'debit'; status: string }) {
    super({
      code: 'WALLET_OPERATION_NOT_ALLOWED',
      message: `Cannot ${props.operation} a wallet that is ${props.status}.`,
      details: {
        operation: props.operation,
        status: props.status,
      },
    });
  }
}

export class InvalidWalletAmountException extends DomainException {
  constructor(amount: Money) {
    super({
      code: 'INVALID_WALLET_AMOUNT',
      message: 'Wallet amount must be greater than zero.',
      details: {
        amount: amount.amount.toString(),
        currency: amount.currency.value,
      },
    });
  }
}

export class InsufficientWalletBalanceException extends DomainException {
  constructor(props: { balance: Money; requested: Money }) {
    super({
      code: 'INSUFFICIENT_WALLET_BALANCE',
      message: 'Insufficient wallet balance.',
      details: {
        balance: props.balance.amount.toString(),
        requested: props.requested.amount.toString(),
        currency: props.balance.currency.toString(),
      },
    });
  }
}

export class WalletNotEmptyException extends DomainException {
  constructor(balance: Money) {
    super({
      code: 'WALLET_NOT_EMPTY',
      message: 'Cannot close a wallet with a non-zero balance.',
      details: {
        balance: balance.amount.toString(),
        currency: balance.currency.toString(),
      },
    });
  }
}

export class WalletNotFoundException extends ApplicationException {
  constructor(id: string) {
    super({
      code: 'WALLET_NOT_FOUND',
      message: `Wallet with ID ${id} not found.`,
      status: ApplicationExceptionStatus.NOT_FOUND,
    });
  }
}

export class WalletAlreadyExistsException extends ApplicationException {
  constructor(props: { customerId: string; currency: string }) {
    super({
      code: 'WALLET_ALREADY_EXISTS',
      message: `Customer ${props.customerId} already has a ${props.currency} wallet.`,
      status: ApplicationExceptionStatus.CONFLICT,
    });
  }
}

export class WalletConcurrencyException extends ApplicationException {
  constructor(id: string) {
    super({
      code: 'WALLET_CONCURRENCY_CONFLICT',
      message: `Wallet ${id} was modified by another operation. Retry.`,
      status: ApplicationExceptionStatus.CONFLICT,
    });
  }
}

export class WalletFrozenException extends DomainException {
  constructor(id: string) {
    super({
      code: 'WALLET_FROZEN',
      message: `Wallet ${id} is frozen and cannot be opened or reopened.`,
      details: { walletId: id },
    });
  }
}
