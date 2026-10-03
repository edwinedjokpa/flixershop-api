interface UnfreezeWalletCommandProps {
  walletId: string;
}

export class UnfreezeWalletCommand {
  constructor(public readonly props: UnfreezeWalletCommandProps) {}
}
