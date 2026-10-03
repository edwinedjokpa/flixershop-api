export const WALLET_STATUSES = {
  ACTIVE: 'active',
  FROZEN: 'frozen',
  CLOSED: 'closed',
} as const;

export type WalletStatusName =
  (typeof WALLET_STATUSES)[keyof typeof WALLET_STATUSES];
