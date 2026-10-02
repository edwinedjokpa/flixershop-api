import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CustomerRegisteredEvent } from '../../domain/events/customer-registered.event.js';
import {
  NOTIFICATION_SENDER,
  type NotificationSender,
} from '@/shared/application/notification/notification-sender.port.js';
import { appConfig } from '@/config/app-config.js';

@EventsHandler(CustomerRegisteredEvent)
export class CustomerRegisteredHandler implements IEventHandler<CustomerRegisteredEvent> {
  constructor(
    @Inject(NOTIFICATION_SENDER)
    private readonly notificationSender: NotificationSender,
  ) {}

  async handle(event: CustomerRegisteredEvent) {
    const { props } = event;

    await this.notificationSender.send({
      recipient: { type: 'customer', id: props.customerId },
      subject: 'Welcome to Flixer Shop',
      template: 'customer/registered',
      variables: { appUrl: appConfig.frontendUrl },
    });
  }
}
