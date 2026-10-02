interface RegisterCustomerCommandProps {
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  preferences: { currency: string };
}

export class RegisterCustomerCommand {
  constructor(public readonly props: RegisterCustomerCommandProps) {}
}
