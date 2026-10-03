import {
  DRIZZLE,
  type DrizzleDB,
} from '@/shared/infrastructure/database/postgress/drizzle.provider.js';
import { Inject, Injectable } from '@nestjs/common';
import {
  OrderFilters,
  OrderRepository,
} from '../../application/ports/order-repository.port.js';
import { Order } from '../../domain/entities/order.entity.js';
import {
  OrderItemRow,
  orderItems,
  OrderRow,
  orders,
} from '@/shared/infrastructure/database/postgress/schema/orders.schema.js';
import { and, eq, ilike, inArray, notInArray, or, SQL } from 'drizzle-orm';
import { OrderId } from '../../domain/value-objects/order-id.vo.js';
import { OrderItem } from '../../domain/entities/order-item.entity.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { UniqueId } from '@/shared/domain/value-objects/unique-id.vo.js';
import { ShippingAddress } from '../../domain/value-objects/shipping-address.vo.js';
import { OrderStatus } from '../../domain/value-objects/order-status.vo.js';
import { TrackingNumber } from '../../domain/value-objects/tracking-number.vo.js';
import { Currency } from '@/shared/domain/value-objects/currency.vo.js';

@Injectable()
export class DrizzleOrderRepository implements OrderRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(order: Order): Promise<void> {
    const orderRow = DrizzleOrderRepository.toOrderPersistence(order);
    const itemRows = order.items.map((item) =>
      DrizzleOrderRepository.toItemPersistence(item, order.id.value),
    );

    await this.db.transaction(async (tx) => {
      await tx
        .insert(orders)
        .values(orderRow)
        .onConflictDoUpdate({
          target: orders.id,
          set: {
            ...orderRow,
          },
        });

      for (const itemRow of itemRows) {
        await tx
          .insert(orderItems)
          .values(itemRow)
          .onConflictDoUpdate({
            target: orderItems.id,
            set: {
              ...itemRow,
            },
          });
      }

      const currentItemIds = itemRows.map((r) => r.id);
      if (currentItemIds.length > 0) {
        await tx
          .delete(orderItems)
          .where(
            and(
              eq(orderItems.orderId, order.id.value),
              notInArray(orderItems.id, currentItemIds),
            ),
          );
      } else {
        await tx
          .delete(orderItems)
          .where(eq(orderItems.orderId, order.id.value));
      }
    });
  }

  async findById(id: OrderId): Promise<Order | null> {
    const result = await this.db.query.orders.findFirst({
      where: eq(orders.id, id.value),
      with: { items: true },
    });

    if (!result) return null;
    return DrizzleOrderRepository.toDomain(result, result.items);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const results = await this.db.query.orders.findMany({
      where: eq(orders.customerId, customerId),
      with: { items: true },
    });

    return results.map((r) => DrizzleOrderRepository.toDomain(r, r.items));
  }

  async findAll(filters: OrderFilters): Promise<Order[]> {
    const conditions: SQL[] = [];

    if (filters.orderId?.trim()) {
      conditions.push(eq(orders.id, filters.orderId.trim()));
    }

    if (filters.customerId?.trim()) {
      conditions.push(eq(orders.customerId, filters.customerId.trim()));
    }

    if (filters.statuses?.length) {
      conditions.push(inArray(orders.status, filters.statuses));
    }

    if (filters.search?.trim()) {
      const search = `%${filters.search.trim()}%`;
      const searchCondition = or(
        ilike(orders.notes, search),
        ilike(orders.trackingNumber, search),
      );

      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const results = await this.db.query.orders.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { items: true },
    });

    return results.map((r) => DrizzleOrderRepository.toDomain(r, r.items));
  }

  async delete(id: OrderId): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(orderItems).where(eq(orderItems.orderId, id.value));
      await tx.delete(orders).where(eq(orders.id, id.value));
    });
  }

  private static toOrderPersistence(order: Order): OrderRow {
    return {
      id: order.id.value,
      customerId: order.customerId,
      status: order.status.value,
      totalAmountMinor: order.total.toMinorUnits(),
      totalCurrency: order.total.currency.value,
      shippingStreet: order.shippingAddress.street,
      shippingCity: order.shippingAddress.city,
      shippingState: order.shippingAddress.state,
      shippingZipCode: order.shippingAddress.zipCode,
      shippingCountry: order.shippingAddress.country,
      trackingNumber: order.trackingNumber?.value ?? null,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private static toItemPersistence(
    item: OrderItem,
    orderId: string,
  ): OrderItemRow {
    return {
      id: item.id.value,
      orderId,
      productId: item.productId,
      productName: item.productName,
      unitPriceAmount: item.unitPrice.toMinorUnits(),
      unitPriceCurrency: item.unitPrice.currency.value,
      quantity: item.quantity,
      discountAmount: item.discount?.toMinorUnits() ?? null,
      discountCurrency: item.discount?.currency.value ?? null,
      createdAt: new Date(),
    };
  }

  private static toDomain(orderRow: OrderRow, itemRows: OrderItemRow[]): Order {
    const items = itemRows.map((row) =>
      OrderItem.reconstitute({
        id: new UniqueId(row.id),
        productId: row.productId,
        productName: row.productName,
        unitPrice: Money.fromMinorUnits(
          row.unitPriceAmount,
          row.unitPriceCurrency,
        ),
        quantity: row.quantity,
        discount:
          row.discountAmount !== null && row.discountCurrency !== null
            ? Money.fromMinorUnits(row.discountAmount, row.discountCurrency)
            : null,
      }),
    );

    return Order.reconstitute({
      id: new OrderId(orderRow.id),
      customerId: orderRow.customerId,
      currency: Currency.create(orderRow.totalCurrency),
      status: OrderStatus.fromString(orderRow.status),
      items,
      shippingAddress: ShippingAddress.create({
        street: orderRow.shippingStreet,
        city: orderRow.shippingCity,
        state: orderRow.shippingState,
        zipCode: orderRow.shippingZipCode,
        country: orderRow.shippingCountry,
      }),
      trackingNumber: orderRow.trackingNumber
        ? TrackingNumber.create(orderRow.trackingNumber)
        : null,
      notes: orderRow.notes,
      createdAt: orderRow.createdAt,
      updatedAt: orderRow.updatedAt,
    });
  }
}
