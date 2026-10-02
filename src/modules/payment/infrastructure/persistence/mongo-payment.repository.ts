import { MONGO_DB } from '@/shared/infrastructure/database/mongodb/mongo.provider.js';
import { Inject, Injectable } from '@nestjs/common';
import { Collection, Db, Long } from 'mongodb';
import { PaymentRepository } from '../../application/ports/payment-repository.port.js';
import { Payment } from '../../domain/entities/payment.entity.js';
import { PaymentId } from '../../domain/value-objects/payment-id.vo.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { PaymentStatus } from '../../domain/value-objects/payment-status.vo.js';
import {
  MongoInt,
  toBigInt,
} from '@/shared/infrastructure/database/mongodb/mongo-int.util.js';
import { PaymentProvider } from '../../domain/value-objects/payment-provider.vo.js';

type MoneyData = { amount: MongoInt; currency: string };

interface PaymentDocument {
  _id: string;
  orderId: string;
  amount: MoneyData;
  status: string;
  provider: string;
  providerTransactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MongoPaymentRepository implements PaymentRepository {
  private readonly collection: Collection<PaymentDocument>;

  constructor(
    @Inject(MONGO_DB)
    private readonly db: Db,
  ) {
    this.collection = this.db.collection<PaymentDocument>('payments');
  }

  async save(payment: Payment): Promise<void> {
    const doc = MongoPaymentRepository.toPersistence(payment);

    await this.collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true },
    );
  }

  async findById(id: PaymentId): Promise<Payment | null> {
    const doc = await this.collection.findOne({ _id: id.value });

    if (!doc) return null;
    return MongoPaymentRepository.toDomain(doc);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const doc = await this.collection.findOne({ orderId: orderId });

    if (!doc) return null;
    return MongoPaymentRepository.toDomain(doc);
  }

  private static toDomain(doc: PaymentDocument): Payment {
    return Payment.reconstitute({
      id: new PaymentId(doc._id),
      orderId: doc.orderId,
      amount: Money.fromMinorUnits(
        toBigInt(doc.amount.amount),
        doc.amount.currency,
      ),
      status: PaymentStatus.fromString(doc.status),
      provider: PaymentProvider.create(doc.provider),
      providerTransactionId: doc.providerTransactionId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private static toPersistence(payment: Payment): PaymentDocument {
    return {
      _id: payment.id.value,
      orderId: payment.orderId,
      amount: {
        amount: Long.fromBigInt(payment.amount.toMinorUnits()),
        currency: payment.amount.currency.value,
      },
      status: payment.status.value,
      provider: payment.provider.value,
      providerTransactionId: payment.providerTransactionId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
