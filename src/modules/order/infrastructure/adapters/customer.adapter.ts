import { Inject, Injectable } from '@nestjs/common';
import {
  CustomerData,
  CustomerPort,
} from '../../application/ports/customer.port.js';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '@/modules/customer/application/ports/customer-repository.port.js';
import { CustomerId } from '@/modules/customer/domain/value-objects/customer-id.vo.js';

@Injectable()
export class CustomerAdapter implements CustomerPort {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async exists(customerId: string): Promise<boolean> {
    const customer = await this.customerRepository.findById(
      new CustomerId(customerId),
    );
    return customer !== null;
  }

  async findById(customerId: string): Promise<CustomerData | null> {
    const customer = await this.customerRepository.findById(
      new CustomerId(customerId),
    );
    if (!customer) return null;

    return {
      id: customer.id.value,
      email: customer.email.value,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      preferences: {
        currency: customer.preferences.currency,
      },
    };
  }
}
