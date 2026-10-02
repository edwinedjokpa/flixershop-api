export interface ListProductQueryProps {
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export class ListProductsQuery {
  constructor(public props: ListProductQueryProps) {}
}
