import { CreatePaymentHandler } from './create-payment/create-payment.handler.js';
import { ConfirmPaymentHandler } from './confirm-payment/confirm-payment.handler.js';
import { ProcessWebhookHandler } from './process-webhook/process-webhook.handler.js';

export const CommandHandlers = [
  CreatePaymentHandler,
  ConfirmPaymentHandler,
  ProcessWebhookHandler,
];
