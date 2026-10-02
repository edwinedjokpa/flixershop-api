import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ConfirmPaymentCommand } from './confirm-payment.command.js';
import {
  PAYMENT_REPOSITORY,
  type PaymentRepository,
} from '../../ports/payment-repository.port.js';
import { PaymentId } from '@/modules/payment/domain/value-objects/payment-id.vo.js';
import { PaymentNotFoundException } from '@/modules/payment/domain/exceptions/payment.exception.js';

@CommandHandler(ConfirmPaymentCommand)
export class ConfirmPaymentHandler implements ICommandHandler<
  ConfirmPaymentCommand,
  void
> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ConfirmPaymentCommand): Promise<void> {
    const { props } = command;

    const payment = await this.paymentRepository.findById(
      new PaymentId(props.paymentId),
    );

    if (!payment) {
      throw new PaymentNotFoundException(props.paymentId);
    }

    if (payment.status.isSucceeded()) {
      return;
    }

    console.log(props.gatewayTransactionId);

    const trackedPayment = this.eventPublisher.mergeObjectContext(payment);
    trackedPayment.complete(props.gatewayTransactionId);

    await this.paymentRepository.save(trackedPayment);
    trackedPayment.commit();
  }
}
