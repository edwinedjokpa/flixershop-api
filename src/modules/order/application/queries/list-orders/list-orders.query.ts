import { OrderStatusValue } from '@/modules/order/domain/value-objects/order-status.vo.js';

interface ListOrdersQueryProps {
  orderId?: string;
  customerId?: string;
  search?: string;
  statuses?: OrderStatusValue[];
}

export class ListOrdersQuery {
  constructor(public readonly props: ListOrdersQueryProps) {}
}
