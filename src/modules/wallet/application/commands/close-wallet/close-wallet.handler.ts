import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WalletNotFoundException } from '../../../domain/exceptions/wallet.exception.js';
import { WalletId } from '../../../domain/value-objects/wallet-id.vo.js';
import {
  WALLET_REPOSITORY,
  type WalletRepository,
} from '../../ports/wallet-repository.port.js';
import { CloseWalletCommand } from './close-wallet.command.js';
import { Inject } from '@nestjs/common';

@CommandHandler(CloseWalletCommand)
export class CloseWalletHandler implements ICommandHandler<CloseWalletCommand> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(command: CloseWalletCommand): Promise<void> {
    const { props } = command;

    const walletId = new WalletId(props.walletId);

    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet || wallet.customerId !== props.customerId)
      throw new WalletNotFoundException(props.walletId);

    wallet.close();
    await this.walletRepository.save(wallet);
  }
}
