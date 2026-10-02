import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrderQuery } from './get-order.query.js';
import { Order } from '@/modules/order/domain/entities/order.entity.js';
import { Inject } from '@nestjs/common';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../../ports/order-repository.port.js';
import { OrderId } from '@/modules/order/domain/value-objects/order-id.vo.js';
import { OrderNotFoundException } from '@/modules/order/domain/exceptions/order.exception.js';

@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery, Order> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(query: GetOrderQuery): Promise<Order> {
    const { props } = query;

    const order = await this.orderRepository.findById(
      new OrderId(props.orderId),
    );

    if (!order) {
      throw new OrderNotFoundException(props.orderId);
    }

    return order;
  }
}
