import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Collection, Db, Long, MongoServerError } from 'mongodb';

import { MONGO_DB } from '@/shared/infrastructure/database/mongodb/mongo.provider.js';
import {
  MongoInt,
  toBigInt,
} from '@/shared/infrastructure/database/mongodb/mongo-int.util.js';
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

type MoneyData = { amountMinor: MongoInt; currency: string };

interface WalletDocument {
  _id: string;
  customerId: string;
  balance: MoneyData;
  status: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MongoWalletRepository implements WalletRepository, OnModuleInit {
  private readonly collection: Collection<WalletDocument>;

  constructor(
    @Inject(MONGO_DB)
    private readonly db: Db,
  ) {
    this.collection = this.db.collection<WalletDocument>('wallets');
  }

  async onModuleInit(): Promise<void> {
    // One wallet per customer per currency.
    await this.collection.createIndex(
      { customerId: 1, 'balance.currency': 1 },
      { unique: true },
    );
  }

  async save(wallet: Wallet): Promise<void> {
    const doc = MongoWalletRepository.toPersistence(wallet);

    try {
      await this.collection.updateOne(
        { _id: doc._id, version: wallet.version },
        { $set: { ...doc, version: wallet.version + 1 } },
        { upsert: true },
      );
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        if (error.keyPattern && '_id' in error.keyPattern) {
          throw new WalletConcurrencyException(wallet.id.value);
        }
        throw new WalletAlreadyExistsException({
          customerId: wallet.customerId,
          currency: wallet.balance.currency.value,
        });
      }
      throw error;
    }
  }

  async findById(id: WalletId): Promise<Wallet | null> {
    const doc = await this.collection.findOne({ _id: id.value });

    if (!doc) return null;
    return MongoWalletRepository.toDomain(doc);
  }

  async findAllByCustomerId(customerId: string): Promise<Wallet[]> {
    const docs = await this.collection.find({ customerId }).toArray();

    return docs.map(MongoWalletRepository.toDomain);
  }

  async findByCustomerIdAndCurrency(
    criteria: FindWalletByCustomerIdAndCurrencyCriteria,
  ): Promise<Wallet | null> {
    const doc = await this.collection.findOne({
      customerId: criteria.customerId,
      'balance.currency': criteria.currency,
    });

    if (!doc) return null;
    return MongoWalletRepository.toDomain(doc);
  }

  private static toDomain(doc: WalletDocument): Wallet {
    return Wallet.reconstitute({
      id: new WalletId(doc._id),
      customerId: doc.customerId,
      balance: Money.fromMinorUnits(
        toBigInt(doc.balance.amountMinor),
        doc.balance.currency,
      ),
      status: WalletStatus.fromString(doc.status),
      version: doc.version,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private static toPersistence(wallet: Wallet): WalletDocument {
    return {
      _id: wallet.id.value,
      customerId: wallet.customerId,
      balance: {
        amountMinor: Long.fromBigInt(wallet.balance.toMinorUnits()),
        currency: wallet.balance.currency.value,
      },
      status: wallet.status.value,
      version: wallet.version,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }
}
