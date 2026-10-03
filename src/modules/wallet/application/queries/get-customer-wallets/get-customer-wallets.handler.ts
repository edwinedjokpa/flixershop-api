import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import {
  WALLET_REPOSITORY,
  type WalletRepository,
} from '../../ports/wallet-repository.port.js';
import { GetCustomerWalletsQuery } from './get-customer-wallets.query.js';
import { Wallet } from '@/modules/wallet/domain/entities/wallet.entity.js';

@QueryHandler(GetCustomerWalletsQuery)
export class GetCustomerWalletsHandler implements IQueryHandler<GetCustomerWalletsQuery> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(query: GetCustomerWalletsQuery): Promise<Wallet[]> {
    const { props } = query;

    return await this.walletRepository.findAllByCustomerId(props.customerId);
  }
}
