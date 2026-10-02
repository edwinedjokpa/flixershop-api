import { CreatePaymentCommand } from '@/modules/payment/application/commands/create-payment/create-payment.command.js';
import { Body, Controller, Headers, Post, RawBody } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePaymentDto } from '../dto/create-payment.dto.js';
import { ProcessWebhookCommand } from '@/modules/payment/application/commands/process-webhook/process-webhook.command.js';
import { PaymentProviderName } from '@/modules/payment/domain/constants/payment-provider.constants.js';

@Controller({ path: 'payments' })
export class PaymentController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createPayment(@Body() dto: CreatePaymentDto) {
    return this.commandBus.execute(
      new CreatePaymentCommand({
        orderId: dto.orderId,
        provider: dto.provider,
        successUrl: dto.successUrl,
        cancelUrl: dto.cancelUrl,
      }),
    );
  }

  @Post('webhooks/stripe')
  async handleStripeWebhook(
    @RawBody() payload: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.commandBus.execute(
      new ProcessWebhookCommand({
        provider: PaymentProviderName.Stripe,
        payload,
        signature,
      }),
    );

    return { received: true };
  }

  @Post('webhooks/paystack')
  async handlePaystackWebhook(
    @RawBody() payload: Buffer,
    @Headers('x-paystack-signature') signature: string,
  ) {
    await this.commandBus.execute(
      new ProcessWebhookCommand({
        provider: PaymentProviderName.Paystack,
        payload,
        signature,
      }),
    );

    return { received: true };
  }
}
