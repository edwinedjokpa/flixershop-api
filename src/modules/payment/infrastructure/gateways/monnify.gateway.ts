import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpClient } from '@nestjs/http-client';
import { type Cache } from 'cache-manager';

import { createHmac, timingSafeEqual } from 'node:crypto';

import {
  PaymentCheckoutResult,
  PaymentGateway,
  PaymentRequest,
  PaymentWebhookResult,
} from '../../application/ports/payment-gateway.port.js';

import {
  InvalidPaymentWebhookException,
  PaymentGatewayException,
} from '../../domain/exceptions/payment-gateway.exception.js';
import { PaymentProviderName } from '../../domain/constants/payment-provider.constants.js';

interface MonnifyResponse<T> {
  requestSuccessful: boolean;
  responseMessage: string;
  responseCode: string;
  responseBody?: T;
}

interface MonnifyLoginBody {
  accessToken: string;
  expiresIn: number;
}

interface MonnifyInitializePayload {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  paymentDescription: string;
  currencyCode: string;
  contractCode: string;
  redirectUrl: string;
  paymentMethods?: Array<'CARD' | 'ACCOUNT_TRANSFER' | 'USSD' | 'PHONE_NUMBER'>;
  metaData?: Record<string, string>;
}

interface MonnifyInitializeBody {
  transactionReference: string;
  paymentReference: string;
  merchantName: string;
  apiKey: string;
  enabledPaymentMethod: string[];
  checkoutUrl: string;
}

interface MonnifyWebhookEvent {
  eventType: string;
  eventData: {
    transactionReference: string;
    paymentReference: string;
    paymentStatus: string;
    metaData?: {
      orderId?: string;
      paymentId?: string;
    };
  };
}

@Injectable()
export class MonnifyPaymentGateway implements PaymentGateway {
  readonly provider = PaymentProviderName.Monnify;

  private readonly apiURL: string;
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly contractCode: string;

  private readonly tokenCacheKey: string;
  private inflightLogin: Promise<string> | null = null;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly httpService: HttpClient,
  ) {
    this.apiKey = this.configService.getOrThrow<string>('MONNIFY_API_KEY');
    this.secretKey =
      this.configService.getOrThrow<string>('MONNIFY_SECRET_KEY');
    this.contractCode = this.configService.getOrThrow<string>(
      'MONNIFY_CONTRACT_CODE',
    );
    this.apiURL = this.configService.getOrThrow<string>('MONNIFY_BASE_URL');

    this.tokenCacheKey = `monnify:access-token:${this.apiURL}`;
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

    const minorUnits = lines.reduce(
      (total, line) =>
        total + line.unitAmount.toMinorUnits() * BigInt(line.quantity),
      0n,
    );

    const token = await this.getAccessToken();

    const payload: MonnifyInitializePayload = {
      amount: this.toMajorUnits(minorUnits),
      customerName: customer.name ?? customer.email,
      customerEmail: customer.email,
      paymentReference: metadata.paymentId,
      paymentDescription: `Payment for order ${metadata.orderId}`,
      currencyCode: lines[0]?.unitAmount.currency.value,
      contractCode: this.contractCode,
      redirectUrl: this.configService.getOrThrow('MONNIFY_SUCCESS_URL'),
      metaData: { orderId: metadata.orderId, paymentId: metadata.paymentId },
    };

    const response = await this.httpService.post<
      MonnifyResponse<MonnifyInitializeBody>
    >(`${this.apiURL}/merchant/transactions/init-transaction`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (
      !response.data ||
      !response.data.requestSuccessful ||
      !response.data.responseBody
    ) {
      throw new PaymentGatewayException(
        response.data.responseMessage ??
          'Failed to initialize Monnify transaction',
      );
    }

    return {
      url: response.data.responseBody.checkoutUrl,
      transactionId: response.data.responseBody.transactionReference,
    };
  }

  handleWebhook(payload: Buffer, signature: string): PaymentWebhookResult {
    const hash = createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    if (!this.safeEqual(hash, signature)) {
      throw new InvalidPaymentWebhookException(
        'Invalid Monnify webhook signature',
      );
    }

    const event = JSON.parse(payload.toString('utf8')) as MonnifyWebhookEvent;

    switch (event.eventType) {
      case 'SUCCESSFUL_TRANSACTION': {
        const { eventData } = event;

        if (eventData.paymentStatus !== 'PAID') {
          return { type: 'payment.ignored' };
        }

        const paymentId =
          eventData.metaData?.paymentId ?? eventData.paymentReference;
        const transactionId = eventData.transactionReference;

        if (!paymentId || !transactionId) {
          throw new InvalidPaymentWebhookException(
            'Monnify webhook is missing payment metadata',
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

  private async login(): Promise<string> {
    const credentials = Buffer.from(
      `${this.apiKey}:${this.secretKey}`,
    ).toString('base64');

    const response = await this.httpService.post<
      MonnifyResponse<MonnifyLoginBody>
    >(`${this.apiURL}/auth/login`, {
      headers: { Authorization: `Basic ${credentials}` },
    });

    if (
      !response.ok ||
      !response.data.requestSuccessful ||
      !response.data.responseBody
    ) {
      throw new PaymentGatewayException(
        response.data.responseMessage ?? 'Failed to authenticate with Monnify',
      );
    }

    const ttlMs = Math.max(
      response.data.responseBody.expiresIn * 1000 - 30_000,
      0,
    );

    await this.cacheManager.set(
      this.tokenCacheKey,
      response.data.responseBody.accessToken,
      ttlMs,
    );

    return response.data.responseBody.accessToken;
  }

  private async getAccessToken(): Promise<string> {
    const cachedData = await this.cacheManager.get<string>(this.tokenCacheKey);
    if (cachedData) return cachedData;

    this.inflightLogin ??= this.login().finally(() => {
      this.inflightLogin = null;
    });

    return this.inflightLogin;
  }

  private toMajorUnits(minor: bigint): number {
    const whole = minor / 100n;
    const fraction = (minor % 100n).toString().padStart(2, '0');
    return Number(`${whole}.${fraction}`);
  }

  private safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
  }
}
