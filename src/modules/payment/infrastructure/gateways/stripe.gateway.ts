import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  PaymentCheckoutResult,
  PaymentGateway,
  PaymentRequest,
  PaymentWebhookResult,
} from '../../application/ports/payment-gateway.port.js';
import { InvalidPaymentWebhookException } from '../../domain/exceptions/payment-gateway.exception.js';
import { PaymentProviderName } from '../../domain/constants/payment.constants.js';

@Injectable()
export class StripePaymentGateway implements PaymentGateway {
  readonly provider: PaymentProviderName = 'stripe';

  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
    this.webhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
  }

  async initiatePayment(
    request: PaymentRequest,
  ): Promise<PaymentCheckoutResult> {
    const { lines, metadata } = request;

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',

      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: line.unitAmount.currency.value.toLowerCase(),
          unit_amount: Number(line.unitAmount.toMinorUnits()),
          product_data: {
            name: line.name,
          },
        },
      })),

      success_url: this.configService.getOrThrow('STRIPE_SUCCESS_URL'),
      cancel_url: this.configService.getOrThrow('STRIPE_CANCEL_URL'),

      metadata: {
        orderId: metadata.orderId,
        paymentId: metadata.paymentId,
      },
    });

    return {
      url: session.url!,
      transactionId: session.id,
    };
  }

  handleWebhook(payload: Buffer, signature: string): PaymentWebhookResult {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const paymentId = session.metadata?.paymentId;
        const transactionId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        if (!paymentId || !transactionId) {
          throw new InvalidPaymentWebhookException(
            'Stripe checkout session is missing payment metadata',
          );
        }

        return {
          type: 'payment.completed',
          paymentId,
          transactionId,
        };
      }

      default:
        return {
          type: 'payment.ignored',
        };
    }
  }
}
