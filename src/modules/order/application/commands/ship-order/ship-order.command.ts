interface ShipOrderCommandProps {
  orderId: string;
}

export class ShipOrderCommand {
  constructor(public readonly props: ShipOrderCommandProps) {}
}
