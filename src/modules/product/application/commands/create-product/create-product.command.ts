export interface CreateProductCommandProps {
  name: string;
  description: string;
  sku: string;
  basePrice: number;
  stock: number;
}

export class CreateProductCommand {
  constructor(public readonly props: CreateProductCommandProps) {}
}
