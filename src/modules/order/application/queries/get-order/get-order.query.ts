interface GetOrderQueryProps {
  orderId: string;
}

export class GetOrderQuery {
  constructor(public readonly props: GetOrderQueryProps) {}
}
