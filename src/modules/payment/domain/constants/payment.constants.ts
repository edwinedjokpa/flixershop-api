export const PAYMENT_PROVIDERS = {
  STRIPE: 'stripe',
  PAYSTACK: 'paystack',
  MONNIFY: 'monnify',
} as const;

export type PaymentProviderName =
  (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
} as const;

export type PaymentStatusValue =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
