import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../../ports/order-repository.port.js';
import { OrderId } from '@/modules/order/domain/value-objects/order-id.vo.js';
import { OrderNotFoundException } from '@/modules/order/domain/exceptions/order.exception.js';
import { ConfirmOrderCommand } from './confirm-order.command.js';

@CommandHandler(ConfirmOrderCommand)
export class ConfirmOrderHandler implements ICommandHandler<
  ConfirmOrderCommand,
  void
> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ConfirmOrderCommand): Promise<void> {
    const { props } = command;

    const order = await this.orderRepository.findById(
      new OrderId(props.orderId),
    );

    if (!order) {
      throw new OrderNotFoundException(props.orderId);
    }

    const trackedOrder = this.eventPublisher.mergeObjectContext(order);

    trackedOrder.confirm();

    await this.orderRepository.save(trackedOrder);
    trackedOrder.commit();
  }
}
