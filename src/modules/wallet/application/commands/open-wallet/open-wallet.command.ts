interface OpenWalletCommandProps {
  customerId: string;
  currency: string;
}

export class OpenWalletCommand {
  constructor(public readonly props: OpenWalletCommandProps) {}
}
