export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
  sku: string;
  basePrice: string;
  currency: string;
  stock: number;
  isActive: boolean;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}
