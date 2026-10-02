export interface DeleteProductCommandProps {
  productId: string;
}

export class DeleteProductCommand {
  constructor(public props: DeleteProductCommandProps) {}
}
