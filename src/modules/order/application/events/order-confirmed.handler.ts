import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderConfirmedEvent } from '../../domain/events/order-confirmed.event.js';
import {
  NOTIFICATION_SENDER,
  type NotificationSender,
} from '@/shared/application/notification/notification-sender.port.js';

@EventsHandler(OrderConfirmedEvent)
export class OrderConfirmedHandler implements IEventHandler<OrderConfirmedEvent> {
  constructor(
    @Inject(NOTIFICATION_SENDER)
    private readonly notificationSender: NotificationSender,
    private readonly configService: ConfigService,
  ) {}

  async handle(event: OrderConfirmedEvent) {
    const { props } = event;

    const shippingTeamEmail = this.configService.getOrThrow(
      'SHIPPING_TEAM_EMAIL',
    );

    await this.notificationSender.send({
      recipient: { type: 'email', email: shippingTeamEmail },
      subject: 'Order Ready to Ship',
      template: 'order/confirmed',
      variables: {
        customerId: props.customerId,
        orderId: props.orderId,
        shippingAddress: { ...props.shippingAddress },
      },
    });
  }
}
