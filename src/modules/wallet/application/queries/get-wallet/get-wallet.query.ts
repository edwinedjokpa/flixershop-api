export interface GetWalletQueryProps {
  walletId: string;
  customerId: string;
}

export class GetWalletQuery {
  constructor(public readonly props: GetWalletQueryProps) {}
}
