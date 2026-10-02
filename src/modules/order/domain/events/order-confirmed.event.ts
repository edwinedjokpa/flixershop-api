export interface OrderConfirmedShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderConfirmedEventProps {
  orderId: string;
  customerId: string;
  shippingAddress: OrderConfirmedShippingAddress;
}

export class OrderConfirmedEvent {
  constructor(public readonly props: OrderConfirmedEventProps) {}
}
