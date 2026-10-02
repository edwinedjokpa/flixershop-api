export interface GetProductQueryProps {
  productId: string;
}

export class GetProductQuery {
  constructor(public readonly props: GetProductQueryProps) {}
}
