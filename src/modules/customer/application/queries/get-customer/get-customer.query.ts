interface GetCustomerQueryProps {
  customerId: string;
}

export class GetCustomerQuery {
  constructor(public readonly props: GetCustomerQueryProps) {}
}
