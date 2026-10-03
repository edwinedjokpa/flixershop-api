interface FreezeWalletCommandProps {
  walletId: string;
}

export class FreezeWalletCommand {
  constructor(public readonly props: FreezeWalletCommandProps) {}
}
