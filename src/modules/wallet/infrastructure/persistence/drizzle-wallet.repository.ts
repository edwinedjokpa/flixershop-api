import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import {
  DRIZZLE,
  type DrizzleDB,
} from '@/shared/infrastructure/database/postgress/drizzle.provider.js';
import {
  WALLET_CUSTOMER_CURRENCY_UNIQUE,
  WalletRow,
  wallets,
} from '@/shared/infrastructure/database/postgress/schema/wallet.schema.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
import {
  FindWalletByCustomerIdAndCurrencyCriteria,
  WalletRepository,
} from '../../application/ports/wallet-repository.port.js';
import { Wallet } from '../../domain/entities/wallet.entity.js';
import { WalletId } from '../../domain/value-objects/wallet-id.vo.js';
import { WalletStatus } from '../../domain/value-objects/wallet-status.vo.js';
import {
  WalletAlreadyExistsException,
  WalletConcurrencyException,
} from '../../domain/exceptions/wallet.exception.js';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class DrizzleWalletRepository implements WalletRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(wallet: Wallet): Promise<void> {
    if (wallet.version === 0) {
      await this.insert(wallet);
      return;
    }
    await this.update(wallet);
  }

  async findById(id: WalletId): Promise<Wallet | null> {
    const [row] = await this.db
      .select()
      .from(wallets)
      .where(eq(wallets.id, id.value))
      .limit(1);

    return row ? DrizzleWalletRepository.toDomain(row) : null;
  }

  async findAllByCustomerId(customerId: string): Promise<Wallet[]> {
    const rows = await this.db
      .select()
      .from(wallets)
      .where(eq(wallets.customerId, customerId))
      .orderBy(wallets.createdAt);

    return rows.map(DrizzleWalletRepository.toDomain);
  }

  async findByCustomerIdAndCurrency(
    criteria: FindWalletByCustomerIdAndCurrencyCriteria,
  ): Promise<Wallet | null> {
    const [row] = await this.db
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.customerId, criteria.customerId),
          eq(wallets.currency, criteria.currency),
        ),
      )
      .limit(1);

    return row ? DrizzleWalletRepository.toDomain(row) : null;
  }

  private async insert(wallet: Wallet): Promise<void> {
    try {
      await this.db.insert(wallets).values({
        id: wallet.id.value,
        customerId: wallet.customerId,
        currency: wallet.balance.currency.value,
        balanceMinor: wallet.balance.toMinorUnits(),
        status: wallet.status.value,
        version: wallet.version + 1,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      });
    } catch (error) {
      const pgError = DrizzleWalletRepository.toPgError(error);

      if (pgError?.code === PG_UNIQUE_VIOLATION) {
        if (pgError.constraint === WALLET_CUSTOMER_CURRENCY_UNIQUE) {
          throw new WalletAlreadyExistsException({
            customerId: wallet.customerId,
            currency: wallet.balance.currency.value,
          });
        }

        throw new WalletConcurrencyException(wallet.id.value);
      }
      throw error;
    }
  }

  private async update(wallet: Wallet): Promise<void> {
    const updated = await this.db
      .update(wallets)
      .set({
        balanceMinor: wallet.balance.toMinorUnits(),
        status: wallet.status.value,
        version: wallet.version + 1,
        updatedAt: wallet.updatedAt,
      })
      .where(
        and(
          eq(wallets.id, wallet.id.value),
          eq(wallets.version, wallet.version),
        ),
      )
      .returning({ id: wallets.id });

    if (updated.length === 0) {
      throw new WalletConcurrencyException(wallet.id.value);
    }
  }

  private static toDomain(row: WalletRow): Wallet {
    return Wallet.reconstitute({
      id: new WalletId(row.id),
      customerId: row.customerId,
      balance: Money.fromMinorUnits(row.balanceMinor, row.currency),
      status: WalletStatus.fromString(row.status),
      version: row.version,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private static toPersistence(wallet: Wallet): WalletRow {
    return {
      id: wallet.id.value,
      customerId: wallet.customerId,
      currency: wallet.balance.currency.value,
      balanceMinor: wallet.balance.toMinorUnits(),
      status: wallet.status.value,
      version: wallet.version,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  private static toPgError(
    error: unknown,
  ): { code?: string; constraint?: string } | undefined {
    if (typeof error !== 'object' || error === null) return undefined;

    const wrapped = (error as { cause?: unknown }).cause;
    const source =
      typeof wrapped === 'object' && wrapped !== null ? wrapped : error;

    return source as { code?: string; constraint?: string };
  }
}
