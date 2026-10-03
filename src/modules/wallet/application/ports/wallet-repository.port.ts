import { Wallet } from '../../domain/entities/wallet.entity.js';
import { WalletId } from '../../domain/value-objects/wallet-id.vo.js';

export const WALLET_REPOSITORY = Symbol('WALLET_REPOSITORY');

export interface FindWalletByCustomerIdAndCurrencyCriteria {
  customerId: string;
  currency: string;
}

export interface WalletRepository {
  save(wallet: Wallet): Promise<void>;
  findById(id: WalletId): Promise<Wallet | null>;
  findAllByCustomerId(customerId: string): Promise<Wallet[]>;
  findByCustomerIdAndCurrency(
    criteria: FindWalletByCustomerIdAndCurrencyCriteria,
  ): Promise<Wallet | null>;
}
