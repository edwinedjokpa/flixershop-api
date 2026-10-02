import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCustomerCommand } from './delete-customer.command.js';
import { Inject } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../ports/customer-repository.port.js';
import { CustomerId } from '@/modules/customer/domain/value-objects/customer-id.vo.js';
import { CustomerNotFoundException } from '@/modules/customer/domain/exceptions/customer.exception.js';

@CommandHandler(DeleteCustomerCommand)
export class DeleteCustomerHandler implements ICommandHandler<
  DeleteCustomerCommand,
  void
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(command: DeleteCustomerCommand): Promise<void> {
    const { props } = command;

    const customerId = new CustomerId(props.customerId);
    const customer = this.customerRepository.findById(customerId);

    if (!customer) {
      throw new CustomerNotFoundException(props.customerId);
    }

    return await this.customerRepository.delete(customerId);
  }
}
