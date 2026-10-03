import { OrderStatusName } from '../../domain/constants/order.constants.js';
import { Order } from '../../domain/entities/order.entity.js';
import { OrderId } from '../../domain/value-objects/order-id.vo.js';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderFilters {
  orderId?: string;
  customerId?: string;
  search?: string;
  statuses?: OrderStatusName[];
}

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  findAll(filters: OrderFilters): Promise<Order[]>;
  delete(id: OrderId): Promise<void>;
}
