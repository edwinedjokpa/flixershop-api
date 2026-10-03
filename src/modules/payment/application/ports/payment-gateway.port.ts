import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { PaymentProviderName } from '../../domain/constants/payment.constants.js';

export interface PaymentCheckoutResult {
  url: string;
  transactionId: string;
}

export interface PaymentCustomer {
  email: string;
  name?: string;
}

export interface PaymentLineItem {
  name: string;
  unitAmount: Money;
  quantity: number;
}

export interface PaymentMetadata {
  orderId: string;
  paymentId: string;
}

export interface PaymentRequest {
  customer: PaymentCustomer;
  lines: PaymentLineItem[];
  metadata: PaymentMetadata;
}

export type PaymentWebhookResult =
  | {
      type: 'payment.completed' | 'payment.failed';
      paymentId: string;
      transactionId: string;
    }
  | { type: 'payment.ignored' };

export interface PaymentGateway {
  readonly provider: PaymentProviderName;

  initiatePayment(request: PaymentRequest): Promise<PaymentCheckoutResult>;
  handleWebhook(payload: Buffer, signature: string): PaymentWebhookResult;
}
