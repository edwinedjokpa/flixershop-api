import { Inject, Injectable } from '@nestjs/common';
import {
  OrderFilters,
  OrderRepository,
} from '../../application/ports/order-repository.port.js';
import { Collection, Db, Filter, Long } from 'mongodb';
import { MONGO_DB } from '@/shared/infrastructure/database/mongodb/mongo.provider.js';
import { Order } from '../../domain/entities/order.entity.js';
import { OrderId } from '../../domain/value-objects/order-id.vo.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { OrderStatus } from '../../domain/value-objects/order-status.vo.js';
import { ShippingAddress } from '../../domain/value-objects/shipping-address.vo.js';
import { OrderItem } from '../../domain/entities/order-item.entity.js';
import { UniqueId } from '@/shared/domain/value-objects/unique-id.vo.js';
import { TrackingNumber } from '../../domain/value-objects/tracking-number.vo.js';
import { Currency } from '@/shared/domain/value-objects/currency.vo.js';
import {
  MongoInt,
  toBigInt,
} from '@/shared/infrastructure/database/mongodb/mongo-int.util.js';

type OrderStatusData =
  'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

type MoneyData = { amount: MongoInt; currency: string };

type ShippingAddressData = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

interface OrderDocument {
  _id: string;
  customerId: string;
  status: OrderStatusData;
  total: MoneyData;
  shippingAddress: ShippingAddressData;
  trackingNumber: string | null;
  notes: string | null;
  items: OrderItemDocument[];
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItemDocument {
  _id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: MoneyData;
  quantity: number;
  discount: MoneyData | null;
  createdAt: Date;
}

@Injectable()
export class MongoOrderRepository implements OrderRepository {
  private readonly collection: Collection<OrderDocument>;

  constructor(
    @Inject(MONGO_DB)
    private readonly db: Db,
  ) {
    this.collection = this.db.collection<OrderDocument>('orders');
  }

  async save(order: Order): Promise<void> {
    const doc = MongoOrderRepository.toPersistence(order);

    await this.collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true },
    );
  }

  async findById(id: OrderId): Promise<Order | null> {
    const doc = await this.collection.findOne({ _id: id.value });

    if (!doc) return null;
    return MongoOrderRepository.toDomain(doc);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const docs = await this.collection
      .find({ customerId: customerId })
      .toArray();

    return docs.map(MongoOrderRepository.toDomain);
  }

  async findAll(filters: OrderFilters): Promise<Order[]> {
    const query: Filter<OrderDocument> = {};

    if (filters.orderId !== undefined && filters.orderId?.trim()) {
      query._id = filters.orderId.trim();
    }

    if (filters.customerId?.trim()) {
      query.customerId = filters.customerId.trim();
    }

    if (filters.statuses?.length) {
      query.status = {
        $in: filters.statuses,
      };
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();

      query.$or = [
        {
          notes: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          trackingNumber: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    const docs = await this.collection.find(query).toArray();
    return docs.map(MongoOrderRepository.toDomain);
  }

  async delete(id: OrderId): Promise<void> {
    await this.collection.deleteOne({ _id: id.value });
  }

  private static toDomain(doc: OrderDocument): Order {
    return Order.reconstitute({
      id: new OrderId(doc._id),
      customerId: doc.customerId,
      currency: Currency.create(doc.total.currency),
      status: OrderStatus.fromString(doc.status),
      items: doc.items.map((item) =>
        OrderItem.reconstitute({
          id: new UniqueId(item._id),
          productId: item.productId,
          productName: item.productName,
          unitPrice: Money.fromMinorUnits(
            toBigInt(item.unitPrice.amount),
            item.unitPrice.currency,
          ),
          quantity: item.quantity,
          discount: item.discount
            ? Money.fromMinorUnits(
                toBigInt(item.discount.amount),
                item.discount.currency,
              )
            : null,
        }),
      ),
      shippingAddress: ShippingAddress.create({
        street: doc.shippingAddress.street,
        city: doc.shippingAddress.city,
        state: doc.shippingAddress.state,
        zipCode: doc.shippingAddress.zipCode,
        country: doc.shippingAddress.country,
      }),
      trackingNumber: doc.trackingNumber
        ? TrackingNumber.create(doc.trackingNumber)
        : null,

      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private static toPersistence(order: Order): OrderDocument {
    return {
      _id: order.id.value,
      customerId: order.customerId,
      status: order.status.value,
      shippingAddress: {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.zipCode,
        country: order.shippingAddress.country,
      },
      trackingNumber: order.trackingNumber?.value ?? null,
      notes: order.notes,
      total: {
        amount: Long.fromBigInt(order.total.toMinorUnits()),
        currency: order.total.currency.value,
      },
      items: order.items.map((item) => ({
        _id: item.id.value,
        orderId: order.id.value,
        productId: item.productId,
        productName: item.productName,
        unitPrice: {
          amount: Long.fromBigInt(item.unitPrice.toMinorUnits()),
          currency: item.unitPrice.currency.value,
        },
        quantity: item.quantity,
        discount: item.discount
          ? {
              amount: Long.fromBigInt(item.discount.toMinorUnits()),
              currency: item.discount.currency.value,
            }
          : null,
        createdAt: order.createdAt,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
