import { pgTable, pgEnum } from 'drizzle-orm/pg-core';
import { orders } from './orders.schema.js';
import { PAYMENT_STATUSES } from '@/modules/payment/domain/constants/payment.constants.js';

export const paymentStatusEnum = pgEnum('payment_status', PAYMENT_STATUSES);

export const payments = pgTable('payments', (t) => ({
  id: t.uuid('id').primaryKey(),
  orderId: t
    .uuid('order_id')
    .notNull()
    .references(() => orders.id),
  provider: t.varchar('provider').notNull(),
  providerTransactionId: t.varchar('provider_transaction_id'),
  status: paymentStatusEnum('status').notNull().default('pending'),
  moneyAmount: t.bigint('money_amount', { mode: 'bigint' }).notNull(),
  moneyCurrency: t.varchar('money_currency', { length: 3 }).notNull(),
  createdAt: t
    .timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: t
    .timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}));

export type PaymentRow = typeof payments.$inferSelect;
