interface DeliverOrderCommandProps {
  orderId: string;
}

export class DeliverOrderCommand {
  constructor(public readonly props: DeliverOrderCommandProps) {}
}
