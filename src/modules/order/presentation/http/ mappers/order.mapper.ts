import { Order } from '@/modules/order/domain/entities/order.entity.js';
import { OrderResponseDto } from '../dto/order-response.dto.js';

export class OrderMapper {
  static toResponse(order: Order): OrderResponseDto {
    return {
      id: order.id.value,
      customerId: order.customerId,
      status: order.status.value,
      items: order.items.map((item) => ({
        id: item.id.value,
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice.amount.toString(),
        currency: item.unitPrice.currency.toString(),
        quantity: item.quantity,
        discount: item.discount ? item.discount.amount.toString() : null,
        subtotal: item.getSubtotal().amount.toString(),
      })),
      totalAmount: order.total.amount.toString(),
      totalCurrency: order.total.currency.toString(),
      itemCount: order.itemCount,
      trackingNumber: order.trackingNumber?.value ?? null,
      notes: order.notes,
      shippingAddress: {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.zipCode,
        country: order.shippingAddress.country,
      },
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  static toResponseList(orders: Order[]): OrderResponseDto[] {
    return orders.map(OrderMapper.toResponse);
  }
}
