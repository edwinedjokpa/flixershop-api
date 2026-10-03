import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { Wallet } from '../../../domain/entities/wallet.entity.js';
import {
  WalletAlreadyExistsException,
  WalletFrozenException,
} from '../../../domain/exceptions/wallet.exception.js';
import {
  WALLET_REPOSITORY,
  type WalletRepository,
} from '../../ports/wallet-repository.port.js';
import { OpenWalletCommand } from './open-wallet.command.js';

@CommandHandler(OpenWalletCommand)
export class OpenWalletHandler implements ICommandHandler<OpenWalletCommand> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(command: OpenWalletCommand): Promise<string> {
    const { props } = command;

    const { customerId, currency } = props;

    const existing = await this.walletRepository.findByCustomerIdAndCurrency({
      customerId,
      currency,
    });

    if (!existing) {
      const wallet = Wallet.open(customerId, currency);
      await this.walletRepository.save(wallet);
      return wallet.id.value;
    }

    if (existing.status.isClosed()) {
      existing.reopen();
      await this.walletRepository.save(existing);
      return existing.id.value;
    }

    if (existing.status.isFrozen()) {
      throw new WalletFrozenException(existing.id.value);
    }

    throw new WalletAlreadyExistsException({ customerId, currency });
  }
}
