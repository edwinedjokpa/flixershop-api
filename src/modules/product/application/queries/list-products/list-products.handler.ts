import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListProductsQuery } from './list-product.query.js';
import { Inject } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../ports/product.repository.port.js';
import { Product } from '@/modules/product/domain/entities/product.entity.js';

@QueryHandler(ListProductsQuery)
export class ListProductsHandler implements IQueryHandler<
  ListProductsQuery,
  Product[]
> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(query: ListProductsQuery): Promise<Product[]> {
    const { props } = query;

    return await this.productRepository.findAll({
      isActive: props.isActive,
      minPrice: props.minPrice,
      maxPrice: props.maxPrice,
    });
  }
}
