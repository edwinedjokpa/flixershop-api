export interface GetCustomerWalletsQueryProps {
  customerId: string;
}

export class GetCustomerWalletsQuery {
  constructor(public readonly props: GetCustomerWalletsQueryProps) {}
}
