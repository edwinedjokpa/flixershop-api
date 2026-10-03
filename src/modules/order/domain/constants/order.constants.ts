export const ORDER_STATUSES = {
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
} as const;

export type OrderStatusName =
  (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];
