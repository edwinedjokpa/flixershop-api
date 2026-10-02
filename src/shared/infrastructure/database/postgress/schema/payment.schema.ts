import { pgTable, pgEnum } from 'drizzle-orm/pg-core';
import { orders } from './orders.schema.js';

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'processing',
  'succeeded',
]);

export const payments = pgTable('payments', (t) => ({
  id: t.uuid('id').primaryKey(),
  orderId: t
    .uuid('order_id')
    .notNull()
    .references(() => orders.id),
  provider: t.varchar('provider').notNull(),
  providerTransactionId: t.varchar('provider_transaction_id'),
  status: paymentStatusEnum('status').notNull().default('pending'),
  amount: t.bigint('amount', { mode: 'bigint' }).notNull(),
  currency: t.varchar('currency', { length: 3 }).notNull(),
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
