import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClient } from '@nestjs/http-client';

import {
  PaymentCheckoutResult,
  PaymentGateway,
  PaymentRequest,
  PaymentWebhookResult,
} from '../../application/ports/payment-gateway.port.js';

import { createHmac } from 'node:crypto';
import {
  InvalidPaymentWebhookException,
  PaymentGatewayException,
} from '../../domain/exceptions/payment-gateway.exception.js';
import { PaymentProviderName } from '../../domain/constants/payment.constants.js';

interface PaystackInitializePayload {
  email: string;
  amount: number;
  currency: string;
  callback_url: string;
  metadata: {
    orderId: string;
    paymentId: string;
  };
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    metadata?: {
      orderId?: string;
      paymentId?: string;
    };
  };
}

@Injectable()
export class PaystackPaymentGateway implements PaymentGateway {
  readonly provider: PaymentProviderName = 'paystack';

  private readonly apiURL: string;
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpClient,
  ) {
    this.apiURL = this.configService.getOrThrow<string>('PAYSTACK_BASE_URL');
    this.secretKey = this.configService.getOrThrow<string>(
      'PAYSTACK_SECRET_KEY',
    );
  }

  async initiatePayment(
    request: PaymentRequest,
  ): Promise<PaymentCheckoutResult> {
    const { customer, lines, metadata } = request;

    if (lines.length === 0) {
      throw new PaymentGatewayException(
        'Cannot initiate payment without line items',
      );
    }

    const amount = lines.reduce(
      (total, line) =>
        total + line.unitAmount.toMinorUnits() * BigInt(line.quantity),
      0n,
    );

    const payload: PaystackInitializePayload = {
      email: customer.email,
      amount: Number(amount),
      currency: lines[0]?.unitAmount.currency.value,
      callback_url: this.configService.getOrThrow<string>(
        'PAYSTACK_SUCCESS_URL',
      ),
      metadata: {
        orderId: metadata.orderId,
        paymentId: metadata.paymentId,
      },
    };

    const response = await this.httpService.post<PaystackInitializeResponse>(
      `${this.apiURL}/transaction/initialize`,
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok || !response.data.status) {
      throw new PaymentGatewayException(
        response.data.message ?? 'Failed to initialize Paystack transaction',
      );
    }

    return {
      url: response.data.data.authorization_url,
      transactionId: response.data.data.reference,
    };
  }

  handleWebhook(payload: Buffer, signature: string): PaymentWebhookResult {
    const hash = createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    if (hash !== signature) {
      throw new InvalidPaymentWebhookException(
        'Invalid Paystack webhook signature',
      );
    }

    const event = JSON.parse(payload.toString('utf8')) as PaystackWebhookEvent;

    switch (event.event) {
      case 'charge.success': {
        const paymentId = event.data.metadata?.paymentId;
        const transactionId = event.data.reference;

        if (!paymentId || !transactionId) {
          throw new InvalidPaymentWebhookException(
            'Paystack webhook is missing payment metadata',
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
