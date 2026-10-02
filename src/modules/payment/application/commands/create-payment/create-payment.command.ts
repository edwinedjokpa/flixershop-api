import { PaymentProviderName } from '@/modules/payment/domain/constants/payment-provider.constants.js';

export interface CreatePaymentCommandProps {
  orderId: string;
  provider: PaymentProviderName;
  successUrl?: string;
  cancelUrl?: string;
}

export class CreatePaymentCommand {
  constructor(public readonly props: CreatePaymentCommandProps) {}
}
