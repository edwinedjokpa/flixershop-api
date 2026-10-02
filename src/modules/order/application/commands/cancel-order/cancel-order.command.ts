interface CancelOrderCommandProps {
  orderId: string;
  reason: string;
}

export class CancelOrderCommand {
  constructor(public readonly props: CancelOrderCommandProps) {}
}
