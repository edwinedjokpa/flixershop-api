import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { OrderCancelledEvent } from '../../domain/events/order-cancelled.event.js';
import {
  NOTIFICATION_SENDER,
  type NotificationSender,
} from '@/shared/application/notification/notification-sender.port.js';

@EventsHandler(OrderCancelledEvent)
export class OrderCancelledHandler implements IEventHandler<OrderCancelledEvent> {
  constructor(
    @Inject(NOTIFICATION_SENDER)
    private readonly notificationSender: NotificationSender,
  ) {}

  async handle(event: OrderCancelledEvent) {
    const { props } = event;

    await this.notificationSender.send({
      recipient: { type: 'customer', id: props.customerId },
      subject: 'Order Cancelled',
      template: 'order/cancelled',
      variables: { orderId: props.orderId },
    });
  }
}
