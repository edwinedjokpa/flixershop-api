import { Inject, Injectable } from '@nestjs/common';
import { PaymentCustomerPort } from '../../application/ports/payment-customer.port.js';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '@/modules/order/application/ports/order-repository.port.js';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '@/modules/customer/application/ports/customer-repository.port.js';
import { OrderId } from '@/modules/order/domain/value-objects/order-id.vo.js';
import { CustomerId } from '@/modules/customer/domain/value-objects/customer-id.vo.js';

@Injectable()
export class PaymentCustomerAdapter implements PaymentCustomerPort {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async getByOrderId(
    orderId: string,
  ): Promise<{ email: string; name?: string } | null> {
    const order = await this.orderRepository.findById(new OrderId(orderId));

    if (!order) {
      return null;
    }

    const customer = await this.customerRepository.findById(
      new CustomerId(order.customerId),
    );

    if (!customer) {
      return null;
    }

    return {
      email: customer.email.value,
      name: customer.fullName,
    };
  }
}
