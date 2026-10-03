import { PaymentProviderName } from '@/modules/payment/domain/constants/payment.constants.js';

interface ProcessWebhookCommandProps {
  provider: PaymentProviderName;
  payload: Buffer;
  signature: string;
}

export class ProcessWebhookCommand {
  constructor(public readonly props: ProcessWebhookCommandProps) {}
}
