import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ProcessWebhookCommand } from './process-webhook.command.js';
import { ConfirmPaymentCommand } from '../confirm-payment/confirm-payment.command.js';

import {
  PAYMENT_GATEWAY_REGISTRY,
  type PaymentGatewayRegistryPort,
} from '../../ports/payment-gateway-registry.port.js';

@CommandHandler(ProcessWebhookCommand)
export class ProcessWebhookHandler implements ICommandHandler<ProcessWebhookCommand> {
  constructor(
    @Inject(PAYMENT_GATEWAY_REGISTRY)
    private readonly gatewayRegistry: PaymentGatewayRegistryPort,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: ProcessWebhookCommand): Promise<any> {
    const { provider, payload, signature } = command.props;

    const gateway = this.gatewayRegistry.get(provider);

    const result = gateway.handleWebhook(payload, signature);

    if (result.type !== 'payment.completed') {
      return;
    }

    await this.commandBus.execute(
      new ConfirmPaymentCommand({
        paymentId: result.paymentId,
        gatewayTransactionId: result.transactionId,
      }),
    );
  }
}
