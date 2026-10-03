interface CloseWalletCommandProps {
  walletId: string;
  customerId: string;
}

export class CloseWalletCommand {
  constructor(public readonly props: CloseWalletCommandProps) {}
}
