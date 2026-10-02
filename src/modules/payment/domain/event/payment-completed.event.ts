interface PaymentCompletedEventProps {
  orderId: string;
  paymentId: string;
  providerTransactionId: string;
}

export class PaymentCompletedEvent {
  constructor(public readonly props: PaymentCompletedEventProps) {}
}
