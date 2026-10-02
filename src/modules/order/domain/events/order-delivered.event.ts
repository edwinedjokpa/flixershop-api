interface OrderDeliveredEventProps {
  orderId: string;
  customerId: string;
}

export class OrderDeliveredEvent {
  constructor(public readonly props: OrderDeliveredEventProps) {}
}
