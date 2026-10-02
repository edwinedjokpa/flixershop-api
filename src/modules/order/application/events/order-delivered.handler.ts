import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { OrderDeliveredEvent } from '../../domain/events/order-delivered.event.js';
import {
  NOTIFICATION_SENDER,
  type NotificationSender,
} from '@/shared/application/notification/notification-sender.port.js';
import { appConfig } from '@/config/app-config.js';

@EventsHandler(OrderDeliveredEvent)
export class OrderDeliveredHandler implements IEventHandler<OrderDeliveredEvent> {
  constructor(
    @Inject(NOTIFICATION_SENDER)
    private readonly notificationSender: NotificationSender,
  ) {}

  async handle(event: OrderDeliveredEvent) {
    const { props } = event;

    await this.notificationSender.send({
      recipient: { type: 'customer', id: props.customerId },
      subject: 'Order Delivered',
      template: 'order/delivered',
      variables: {
        orderId: props.orderId,
        appUrl: `${appConfig.frontendUrl}/orders/${props.orderId}`,
      },
    });
  }
}
