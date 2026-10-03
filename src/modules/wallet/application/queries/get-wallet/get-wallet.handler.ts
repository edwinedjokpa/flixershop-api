import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { WalletNotFoundException } from '../../../domain/exceptions/wallet.exception.js';
import { WalletId } from '../../../domain/value-objects/wallet-id.vo.js';
import {
  WALLET_REPOSITORY,
  type WalletRepository,
} from '../../ports/wallet-repository.port.js';
import { GetWalletQuery } from './get-wallet.query.js';
import { Wallet } from '@/modules/wallet/domain/entities/wallet.entity.js';

@QueryHandler(GetWalletQuery)
export class GetWalletHandler implements IQueryHandler<GetWalletQuery> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(query: GetWalletQuery): Promise<Wallet> {
    const { props } = query;

    const wallet = await this.walletRepository.findById(
      new WalletId(props.walletId),
    );
    if (!wallet || wallet.customerId !== props.customerId) {
      throw new WalletNotFoundException(props.walletId);
    }

    return wallet;
  }
}
