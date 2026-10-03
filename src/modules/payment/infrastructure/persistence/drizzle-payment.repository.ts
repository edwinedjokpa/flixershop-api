import {
  DRIZZLE,
  type DrizzleDB,
} from '@/shared/infrastructure/database/postgress/drizzle.provider.js';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PaymentRepository } from '../../application/ports/payment-repository.port.js';
import { Payment } from '../../domain/entities/payment.entity.js';
import {
  PaymentRow,
  payments,
} from '@/shared/infrastructure/database/postgress/schema/payment.schema.js';
import { PaymentId } from '../../domain/value-objects/payment-id.vo.js';
import { PaymentStatus } from '../../domain/value-objects/payment-status.vo.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { PaymentProvider } from '../../domain/value-objects/payment-provider.vo.js';

@Injectable()
export class DrizzlePaymentRepository implements PaymentRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(payment: Payment): Promise<void> {
    const row = DrizzlePaymentRepository.toPersistence(payment);

    await this.db
      .insert(payments)
      .values(row)
      .onConflictDoUpdate({
        target: payments.id,
        set: {
          ...row,
        },
      });
  }

  async findById(id: PaymentId): Promise<Payment | null> {
    const row = await this.db.query.payments.findFirst({
      where: eq(payments.id, id.value),
    });

    if (!row) return null;
    return DrizzlePaymentRepository.toDomain(row);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const row = await this.db.query.payments.findFirst({
      where: eq(payments.orderId, orderId),
    });

    if (!row) return null;
    return DrizzlePaymentRepository.toDomain(row);
  }

  private static toDomain(row: PaymentRow): Payment {
    return Payment.reconstitute({
      id: new PaymentId(row.id),
      orderId: row.orderId,
      money: Money.fromMinorUnits(row.moneyAmount, row.moneyCurrency),
      status: PaymentStatus.fromString(row.status),
      provider: PaymentProvider.create(row.provider),
      providerTransactionId: row.providerTransactionId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private static toPersistence(payment: Payment): PaymentRow {
    return {
      id: payment.id.value,
      orderId: payment.orderId,
      moneyAmount: payment.money.toMinorUnits(),
      moneyCurrency: payment.money.currency.value,
      status: payment.status.value,
      provider: payment.provider.value,
      providerTransactionId: payment.providerTransactionId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
