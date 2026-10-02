import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCustomerCommand } from './register-customer.command.js';
import { Inject } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '../../ports/customer-repository.port.js';
import { Email } from '@/modules/customer/domain/value-objects/email.vo.js';
import { CustomerAlreadyExistsException } from '@/modules/customer/domain/exceptions/customer.exception.js';
import { Customer } from '@/modules/customer/domain/entities/customer.entity.js';

@CommandHandler(RegisterCustomerCommand)
export class RegisterCustomerHandler implements ICommandHandler<
  RegisterCustomerCommand,
  void
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RegisterCustomerCommand): Promise<void> {
    const { props } = command;

    const email = Email.create(props.email);
    const existingCustomer = await this.customerRepository.findByEmail(email);

    if (existingCustomer) {
      throw new CustomerAlreadyExistsException(email.value);
    }

    const customer = this.eventPublisher.mergeObjectContext(
      Customer.register({
        email,
        firstName: props.firstName,
        lastName: props.lastName,
        phone: props.phone,
        preferences: props.preferences,
      }),
    );

    await this.customerRepository.save(customer);

    customer.commit();
  }
}
