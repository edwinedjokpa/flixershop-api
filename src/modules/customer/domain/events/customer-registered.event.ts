export interface CustomerRegisteredEventProps {
  customerId: string;
  currency: string;
  email: string;
  firstName: string;
}

export class CustomerRegisteredEvent {
  constructor(public readonly props: CustomerRegisteredEventProps) {}
}
