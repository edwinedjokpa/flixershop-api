import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { OrderShippedEvent } from '../../domain/events/order-shipped.event.js';
import {
  NOTIFICATION_SENDER,
  type NotificationSender,
} from '@/shared/application/notification/notification-sender.port.js';

@EventsHandler(OrderShippedEvent)
export class OrderShippedHandler implements IEventHandler<OrderShippedEvent> {
  constructor(
    @Inject(NOTIFICATION_SENDER)
    private readonly notificationSender: NotificationSender,
  ) {}

  async handle(event: OrderShippedEvent) {
    const { props } = event;

    await this.notificationSender.send({
      recipient: { type: 'customer', id: props.customerId },
      subject: 'Order Shipped',
      template: 'order/shipped',
      variables: {
        orderId: props.orderId,
        trackingNumber: props.trackingNumber,
      },
    });
  }
}
