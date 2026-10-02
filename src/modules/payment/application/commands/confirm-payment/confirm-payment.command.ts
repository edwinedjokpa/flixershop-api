export interface ConfirmPaymentCommandProps {
  paymentId: string;
  gatewayTransactionId: string;
}

export class ConfirmPaymentCommand {
  constructor(public readonly props: ConfirmPaymentCommandProps) {}
}
