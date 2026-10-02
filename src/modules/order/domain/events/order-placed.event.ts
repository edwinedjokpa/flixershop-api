interface OrderPlacedEventProps {
  orderId: string;
  customerId: string;
}

export class OrderPlacedEvent {
  constructor(public readonly props: OrderPlacedEventProps) {}
}
