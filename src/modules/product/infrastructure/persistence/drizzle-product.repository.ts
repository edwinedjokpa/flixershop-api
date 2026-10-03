import { Inject, Injectable } from '@nestjs/common';
import {
  ProductFilters,
  ProductRepository,
} from '../../application/ports/product.repository.port.js';
import { Product } from '../../domain/entities/product.entity.js';
import { ProductId } from '../../domain/value-objects/product-id.vo.js';
import { Sku } from '../../domain/value-objects/sku.vo.js';
import {
  DRIZZLE,
  type DrizzleDB,
} from '@/shared/infrastructure/database/postgress/drizzle.provider.js';
import { products } from '@/shared/infrastructure/database/postgress/schema/index.js';
import { and, eq, gte, lte, SQL } from 'drizzle-orm';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { ProductRow } from '@/shared/infrastructure/database/postgress/schema/product.schema.js';

@Injectable()
export class DrizzleProductRepository implements ProductRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(product: Product): Promise<void> {
    const data = DrizzleProductRepository.toPersistence(product);

    await this.db
      .insert(products)
      .values(data)
      .onConflictDoUpdate({
        target: products.id,
        set: {
          ...data,
        },
      });
  }

  async findById(id: ProductId): Promise<Product | null> {
    const [row] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id.value));

    if (!row) return null;

    return DrizzleProductRepository.toDomain(row);
  }

  async findBySku(sku: Sku): Promise<Product | null> {
    const [row] = await this.db
      .select()
      .from(products)
      .where(eq(products.sku, sku.value));

    if (!row) return null;

    return DrizzleProductRepository.toDomain(row);
  }

  async findByName(name: string): Promise<Product | null> {
    const [row] = await this.db
      .select()
      .from(products)
      .where(eq(products.name, name));

    if (!row) return null;

    return DrizzleProductRepository.toDomain(row);
  }

  async findAll(filters: ProductFilters): Promise<Product[]> {
    const conditions: SQL[] = [];

    if (filters?.isActive !== undefined) {
      conditions.push(eq(products.isActive, filters.isActive));
    }

    const minPrice =
      filters?.minPrice !== undefined
        ? BigInt(Math.round(filters.minPrice * 100))
        : undefined;

    const maxPrice =
      filters?.maxPrice !== undefined
        ? BigInt(Math.round(filters.maxPrice * 100))
        : undefined;

    if (minPrice !== undefined) {
      conditions.push(gte(products.basePriceAmountMinor, minPrice));
    }

    if (maxPrice !== undefined) {
      conditions.push(lte(products.basePriceAmountMinor, maxPrice));
    }

    const rows =
      conditions.length > 0
        ? await this.db
            .select()
            .from(products)
            .where(and(...conditions))
        : await this.db.select().from(products);

    return rows.map((row) => DrizzleProductRepository.toDomain(row));
  }

  async delete(id: ProductId): Promise<void> {
    await this.db.delete(products).where(eq(products.id, id.value));
  }

  private static toDomain(row: ProductRow): Product {
    return Product.reconstitute({
      id: new ProductId(row.id),
      name: row.name,
      description: row.description,
      sku: Sku.create(row.sku),
      basePrice: Money.fromMinorUnits(
        row.basePriceAmountMinor,
        row.basePriceCurrency,
      ),
      stock: row.stock,
      isActive: row.isActive,
      lowStockThreshold: row.lowStockThreshold,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private static toPersistence(product: Product): ProductRow {
    return {
      id: product.id.value,
      name: product.name,
      description: product.description,
      sku: product.sku.value,
      basePriceAmountMinor: product.basePrice.toMinorUnits(),
      basePriceCurrency: product.basePrice.currency.value,
      stock: product.stock,
      isActive: product.isActive,
      lowStockThreshold: product.lowStockThreshold,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
