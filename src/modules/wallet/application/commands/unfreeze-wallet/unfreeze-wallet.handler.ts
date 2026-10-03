import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { WalletNotFoundException } from '../../../domain/exceptions/wallet.exception.js';
import { WalletId } from '../../../domain/value-objects/wallet-id.vo.js';
import {
  WALLET_REPOSITORY,
  type WalletRepository,
} from '../../ports/wallet-repository.port.js';
import { UnfreezeWalletCommand } from './unfreeze-wallet.command.js';

@CommandHandler(UnfreezeWalletCommand)
export class UnfreezeWalletHandler implements ICommandHandler<UnfreezeWalletCommand> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(command: UnfreezeWalletCommand): Promise<void> {
    const { props } = command;

    const walletId = new WalletId(props.walletId);

    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) throw new WalletNotFoundException(props.walletId);

    wallet.unfreeze();
    await this.walletRepository.save(wallet);
  }
}
