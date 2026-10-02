import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderPlacedEvent } from '../../domain/events/order-placed.event.js';
import {
  NOTIFICATION_SENDER,
  type NotificationSender,
} from '@/shared/application/notification/notification-sender.port.js';
import { appConfig } from '@/config/app-config.js';

@EventsHandler(OrderPlacedEvent)
export class OrderPlacedHandler implements IEventHandler<OrderPlacedEvent> {
  constructor(
    @Inject(NOTIFICATION_SENDER)
    private readonly notificationSender: NotificationSender,
  ) {}

  async handle(event: OrderPlacedEvent) {
    const { props } = event;

    await this.notificationSender.send({
      recipient: { type: 'customer', id: props.customerId },
      subject: 'Order Confirmation',
      template: 'order/placed',
      variables: {
        orderId: props.orderId,
        appUrl: `${appConfig.frontendUrl}/orders/${props.orderId}`,
      },
    });
  }
}
