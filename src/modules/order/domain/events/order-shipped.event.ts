interface OrderShippedEventProps {
  orderId: string;
  customerId: string;
  trackingNumber: string;
}

export class OrderShippedEvent {
  constructor(public readonly props: OrderShippedEventProps) {}
}
