interface OrderCancelledEventProps {
  orderId: string;
  customerId: string;
}

export class OrderCancelledEvent {
  constructor(public readonly props: OrderCancelledEventProps) {}
}
