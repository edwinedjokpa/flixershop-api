class OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  unitPrice: string;
  currency: string;
  quantity: number;
  discount: string | null;
  subtotal: string;
}

class ShippingAddressDto {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export class OrderResponseDto {
  id: string;
  customerId: string;
  status: string;
  items: OrderItemResponseDto[];
  totalAmount: string;
  totalCurrency: string;
  itemCount: number;
  trackingNumber: string | null;
  notes: string | null;
  shippingAddress: ShippingAddressDto;
  createdAt: string;
  updatedAt: string;
}
