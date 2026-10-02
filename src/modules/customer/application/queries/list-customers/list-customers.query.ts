interface ListCustomersQueryProps {
  isActive?: boolean;
  search?: string;
}

export class ListCustomersQuery {
  constructor(public readonly props: ListCustomersQueryProps) {}
}
