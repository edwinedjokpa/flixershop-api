export interface PlaceOrderItemProps {
  productId: string;
  quantity: number;
  discount?: number;
}

interface PlaceOrderCommandProps {
  customerId: string;
  items: PlaceOrderItemProps[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string | null;
}

export class PlaceOrderCommand {
  constructor(public readonly props: PlaceOrderCommandProps) {}
}
