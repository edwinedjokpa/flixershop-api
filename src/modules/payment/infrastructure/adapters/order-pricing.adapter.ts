import { Inject, Injectable } from '@nestjs/common';
import {
  OrderPricing,
  OrderPricingPort,
  PricingLine,
} from '../../application/ports/order-pricing.port.js';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '@/modules/order/application/ports/order-repository.port.js';
import { OrderId } from '@/modules/order/domain/value-objects/order-id.vo.js';
import { OrderItem } from '@/modules/order/domain/entities/order-item.entity.js';

@Injectable()
export class OrderPricingAdapter implements OrderPricingPort {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async getOrderPricing(orderId: string): Promise<OrderPricing | null> {
    const order = await this.orderRepository.findById(new OrderId(orderId));
    if (!order) {
      return null;
    }

    return {
      total: order.total,
      lines: order.items.map((item) => this.toPricingLine(item)),
    };
  }

  private toPricingLine(item: OrderItem): PricingLine {
    return {
      name: item.productName,
      quantity: item.quantity,
      unitAmount: item.getEffectiveUnitPrice(),
    };
  }
}
