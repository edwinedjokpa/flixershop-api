import { Inject, Injectable } from '@nestjs/common';
import {
  ProductData,
  ProductPort,
} from '../../application/ports/product.port.js';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '@/modules/product/application/ports/product.repository.port.js';
import { ProductId } from '@/modules/product/domain/value-objects/product-id.vo.js';

@Injectable()
export class ProductAdapter implements ProductPort {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async exists(productId: string): Promise<boolean> {
    const product = await this.productRepository.findById(
      new ProductId(productId),
    );
    return product !== null;
  }

  async findById(productId: string): Promise<ProductData | null> {
    const product = await this.productRepository.findById(
      new ProductId(productId),
    );

    return product
      ? {
          id: product.id.value,
          name: product.name,
          basePrice: product.basePrice,
        }
      : null;
  }
}
