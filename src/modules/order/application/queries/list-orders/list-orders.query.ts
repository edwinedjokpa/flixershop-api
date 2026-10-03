import { OrderStatusName } from '@/modules/order/domain/constants/order.constants.js';

interface ListOrdersQueryProps {
  orderId?: string;
  customerId?: string;
  search?: string;
  statuses?: OrderStatusName[];
}

export class ListOrdersQuery {
  constructor(public readonly props: ListOrdersQueryProps) {}
}
