interface DeleteCustomerCommandProps {
  customerId: string;
}

export class DeleteCustomerCommand {
  constructor(public readonly props: DeleteCustomerCommandProps) {}
}
