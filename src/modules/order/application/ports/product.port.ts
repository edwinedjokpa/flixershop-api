import { Money } from '@/shared/domain/value-objects/money.vo.js';

export const PRODUCT = Symbol('PRODUCT');

export interface ProductData {
  id: string;
  name: string;
  basePrice: Money;
}

export interface ProductPort {
  exists(productId: string): Promise<boolean>;

  findById(productId: string): Promise<ProductData | null>;
}
