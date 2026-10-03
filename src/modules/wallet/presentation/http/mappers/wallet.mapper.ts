import { Wallet } from '@/modules/wallet/domain/entities/wallet.entity.js';
import { WalletResponseDto } from '../dto/wallet-response.dto.js';

export class WalletMapper {
  static toResponse(wallet: Wallet): WalletResponseDto {
    return {
      id: wallet.id.value,
      customerId: wallet.customerId,
      currency: wallet.balance.currency.value,
      balance: wallet.balance.formatAmount(),
      status: wallet.status.value,
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString(),
    };
  }

  static toResponseList(wallets: Wallet[]): WalletResponseDto[] {
    return wallets.map(WalletMapper.toResponse);
  }
}
