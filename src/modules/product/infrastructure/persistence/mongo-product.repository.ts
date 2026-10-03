import { Inject, Injectable } from '@nestjs/common';
import {
  ProductFilters,
  ProductRepository,
} from '../../application/ports/product.repository.port.js';
import { MONGO_DB } from '@/shared/infrastructure/database/mongodb/mongo.provider.js';
import { Collection, Db, Filter } from 'mongodb';
import { Product } from '../../domain/entities/product.entity.js';
import { Sku } from '../../domain/value-objects/sku.vo.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { ProductId } from '../../domain/value-objects/product-id.vo.js';
import {
  MongoInt,
  toBigInt,
} from '@/shared/infrastructure/database/mongodb/mongo-int.util.js';

type ProductPriceData = { amountMinor: MongoInt; currency: string };

interface ProductDocument {
  _id: string;
  name: string;
  description: string;
  sku: string;
  basePrice: ProductPriceData;
  stock: number;
  isActive: boolean;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MongoProductRepository implements ProductRepository {
  private readonly collection: Collection<ProductDocument>;

  constructor(
    @Inject(MONGO_DB)
    private readonly db: Db,
  ) {
    this.collection = this.db.collection<ProductDocument>('products');
  }

  async save(product: Product): Promise<void> {
    const doc = MongoProductRepository.toPersistence(product);

    await this.collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true },
    );
  }

  async findById(id: ProductId): Promise<Product | null> {
    const doc = await this.collection.findOne({ _id: id.value });

    if (!doc) return null;
    return MongoProductRepository.toDomain(doc);
  }

  async findBySku(sku: Sku): Promise<Product | null> {
    const doc = await this.collection.findOne({ sku: sku.value });

    if (!doc) return null;
    return MongoProductRepository.toDomain(doc);
  }

  async findByName(name: string): Promise<Product | null> {
    const doc = await this.collection.findOne({ name });

    if (!doc) return null;
    return MongoProductRepository.toDomain(doc);
  }

  async findAll(filters: ProductFilters): Promise<Product[]> {
    const query: Filter<ProductDocument> = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      query.priceAmount = {};

      if (filters?.minPrice !== undefined) {
        query.priceAmount.$gte = Math.round(filters.minPrice * 100);
      }

      if (filters?.maxPrice !== undefined) {
        query.priceAmount.$lte = Math.round(filters.maxPrice * 100);
      }
    }

    const docs = await this.collection.find(query).toArray();
    return docs.map(MongoProductRepository.toDomain);
  }

  async delete(id: ProductId): Promise<void> {
    await this.collection.deleteOne({ _id: id.value });
  }

  private static toDomain(doc: ProductDocument): Product {
    return Product.reconstitute({
      id: new ProductId(doc._id),
      name: doc.name,
      description: doc.description,
      sku: Sku.create(doc.sku),
      basePrice: Money.fromMinorUnits(
        doc.basePrice.amountMinor.toString(),
        doc.basePrice.currency,
      ),
      stock: doc.stock,
      isActive: doc.isActive,
      lowStockThreshold: doc.lowStockThreshold ?? 5,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private static toPersistence(product: Product): ProductDocument {
    return {
      _id: product.id.value,
      name: product.name,
      description: product.description,
      sku: product.sku.value,
      basePrice: {
        amountMinor: toBigInt(product.basePrice.toMinorUnits()),
        currency: product.basePrice.currency.value,
      },
      stock: product.stock,
      isActive: product.isActive,
      lowStockThreshold: product.lowStockThreshold,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
