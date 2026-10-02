import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductQuery } from './get-product.query.js';
import { Inject } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../ports/product.repository.port.js';
import { ProductId } from '@/modules/product/domain/value-objects/product-id.vo.js';
import { ProductNotFoundException } from '@/modules/product/domain/exceptions/product.exception.js';
import { Product } from '@/modules/product/domain/entities/product.entity.js';

@QueryHandler(GetProductQuery)
export class GetProductHandler implements IQueryHandler<
  GetProductQuery,
  Product
> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(query: GetProductQuery): Promise<Product> {
    const { props } = query;
    const productId = new ProductId(props.productId);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(props.productId);
    }

    return product;
  }
}
