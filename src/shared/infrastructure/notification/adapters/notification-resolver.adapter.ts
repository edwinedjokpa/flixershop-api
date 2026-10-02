import {
  CUSTOMER_REPOSITORY,
  type CustomerRepository,
} from '@/modules/customer/application/ports/customer-repository.port.js';
import { CustomerNotFoundException } from '@/modules/customer/domain/exceptions/customer.exception.js';
import { CustomerId } from '@/modules/customer/domain/value-objects/customer-id.vo.js';
import {
  NotificationRecipient,
  NotificationRecipientResolverPort,
} from '@/shared/application/notification/notification-resolver.port.js';
import { NotificationRecipientOptions } from '@/shared/application/notification/notification-sender.port.js';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class NotificationRecipientResolverAdapter implements NotificationRecipientResolverPort {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async resolve(
    recipient: NotificationRecipientOptions,
  ): Promise<NotificationRecipient> {
    if (recipient.type === 'email') {
      return {
        email: recipient.email,
      };
    }

    const customer = await this.customerRepository.findById(
      new CustomerId(recipient.id),
    );

    if (!customer) {
      throw new CustomerNotFoundException(recipient.id);
    }

    return {
      id: recipient.id,
      email: customer.email.toString(),
      firstName: customer.firstName,
    };
  }
}
