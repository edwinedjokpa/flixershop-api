import { WALLET_STATUSES } from '@/modules/wallet/domain/constants/wallet.constants.js';
import { sql } from 'drizzle-orm';
import { check, pgEnum, pgTable, uniqueIndex } from 'drizzle-orm/pg-core';

export const walletStatusEnum = pgEnum('wallet_status', WALLET_STATUSES);

export const WALLET_CUSTOMER_CURRENCY_UNIQUE = 'wallets_customer_currency_uq';

export const wallets = pgTable(
  'wallets',
  (t) => ({
    id: t.uuid('id').primaryKey(),
    customerId: t.uuid('customer_id').notNull(),
    balanceMinor: t
      .bigint('balance_minor', { mode: 'bigint' })
      .notNull()
      .default(sql`0`),
    currency: t.varchar('currency', { length: 3 }).notNull(),
    status: walletStatusEnum('status').notNull().default('active'),
    version: t.integer('version').notNull().default(1),
    createdAt: t.timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: t.timestamp('updated_at', { withTimezone: true }).notNull(),
  }),
  (table) => [
    uniqueIndex(WALLET_CUSTOMER_CURRENCY_UNIQUE).on(
      table.customerId,
      table.currency,
    ),
    check('wallets_balance_non_negative', sql`${table.balanceMinor} >= 0`),
  ],
);

export type WalletRow = typeof wallets.$inferSelect;
