import { ProductId } from '../value-objects/product-id.vo.js';
import { Sku } from '../value-objects/sku.vo.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { AggregateRoot } from '@/shared/domain/aggregate-root.js';
import {
  InvalidProductNameException,
  NegativeProductStockException,
} from '../exceptions/product.exception.js';

interface ProductProps {
  id: ProductId;
  name: string;
  description: string;
  basePrice: Money;
  sku: Sku;
  stock: number;
  isActive: boolean;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateProductProps {
  name: string;
  description: string;
  sku: string;
  basePrice: number;
  currency: string;
  stock: number;
}

export class Product extends AggregateRoot {
  private readonly _id: ProductId;
  private _name: string;
  private _description: string;
  private _sku: Sku;
  private _basePrice: Money;
  private _stock: number;
  private _isActive: boolean;
  private _lowStockThreshold: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ProductProps) {
    super();
    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._sku = props.sku;
    this._basePrice = props.basePrice;
    this._stock = props.stock;
    this._isActive = props.isActive;
    this._lowStockThreshold = props.lowStockThreshold;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateProductProps): Product {
    Product.validateName(props.name);
    Product.validateStock(props.stock);

    const now = new Date();
    const productProps: ProductProps = {
      id: new ProductId(),
      name: props.name,
      description: props.description,
      sku: Sku.create(props.sku),
      basePrice: Money.create(props.basePrice, props.currency),
      stock: props.stock,
      isActive: true,
      lowStockThreshold: 5,
      createdAt: now,
      updatedAt: now,
    };

    return new Product(productProps);
  }

  static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  get id(): ProductId {
    return this._id;
  }

  get sku(): Sku {
    return this._sku;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get basePrice(): Money {
    return this.basePrice;
  }

  get stock(): number {
    return this._stock;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lowStockThreshold(): number {
    return this._lowStockThreshold;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private static validateName(name: string): void {
    if (name.length < 2) {
      throw new InvalidProductNameException();
    }
  }

  private static validateStock(stock: number): void {
    if (stock < 0) {
      throw new NegativeProductStockException();
    }
  }
}
