export interface ConfirmOrderCommandProps {
  orderId: string;
}

export class ConfirmOrderCommand {
  constructor(public readonly props: ConfirmOrderCommandProps) {}
}
