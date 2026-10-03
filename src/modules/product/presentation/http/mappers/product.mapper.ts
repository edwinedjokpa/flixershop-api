import { Product } from '@/modules/product/domain/entities/product.entity.js';
import { ProductResponseDto } from '../dto/product-response.dto.js';

export class ProductMapper {
  static toResponse(product: Product): ProductResponseDto {
    return {
      id: product.id.value,
      name: product.name,
      description: product.description,
      sku: product.sku.value,
      basePrice: product.basePrice.formatAmount(),
      currency: product.basePrice.currency.toString(),
      stock: product.stock,
      isActive: product.isActive,
      lowStockThreshold: product.lowStockThreshold,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  static toResponseList(products: Product[]): ProductResponseDto[] {
    return products.map(ProductMapper.toResponse);
  }
}
