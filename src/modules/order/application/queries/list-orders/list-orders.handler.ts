import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListOrdersQuery } from './list-orders.query.js';
import { Order } from '@/modules/order/domain/entities/order.entity.js';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../../ports/order-repository.port.js';

@QueryHandler(ListOrdersQuery)
export class ListOrdersHandler implements IQueryHandler<
  ListOrdersQuery,
  Order[]
> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(query: ListOrdersQuery): Promise<Order[]> {
    const { props } = query;

    return this.orderRepository.findAll({
      orderId: props.orderId,
      search: props.search,
      statuses: props.statuses,
    });
  }
}
