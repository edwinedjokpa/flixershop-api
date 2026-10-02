import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCustomerQuery } from './get-customer.query.js';
import { Customer } from '@/modules/customer/domain/entities/customer.entity.js';
import { Inject } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../ports/customer-repository.port.js';
import { CustomerId } from '@/modules/customer/domain/value-objects/customer-id.vo.js';
import { CustomerNotFoundException } from '@/modules/customer/domain/exceptions/customer.exception.js';

@QueryHandler(GetCustomerQuery)
export class GetCustomerHandler implements IQueryHandler<
  GetCustomerQuery,
  Customer
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(query: GetCustomerQuery): Promise<Customer> {
    const { props } = query;

    const customerId = new CustomerId(props.customerId);
    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new CustomerNotFoundException(props.customerId);
    }

    return customer;
  }
}
