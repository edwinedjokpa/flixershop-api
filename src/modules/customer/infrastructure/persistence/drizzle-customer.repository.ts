import {
  DRIZZLE,
  type DrizzleDB,
} from '@/shared/infrastructure/database/postgress/drizzle.provider.js';
import { Inject, Injectable } from '@nestjs/common';
import {
  CustomerFilters,
  CustomerRepository,
} from '../../application/ports/customer-repository.port.js';
import { Customer } from '../../domain/entities/customer.entity.js';
import {
  CustomerRow,
  customers,
} from '@/shared/infrastructure/database/postgress/schema/customer.schema.js';
import { CustomerId } from '../../domain/value-objects/customer-id.vo.js';
import { and, eq, ilike, or, SQL } from 'drizzle-orm';
import { Email } from '../../domain/value-objects/email.vo.js';
import { CustomerPreferences } from '../../domain/value-objects/preferences.vo.js';

@Injectable()
export class DrizzleCustomerRepository implements CustomerRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(customer: Customer): Promise<void> {
    const data = DrizzleCustomerRepository.toPersistence(customer);

    await this.db
      .insert(customers)
      .values(data)
      .onConflictDoUpdate({
        target: customers.id,
        set: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          isActive: data.isActive,
          updatedAt: data.updatedAt,
        },
      });
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const [row] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, id.value));

    if (!row) return null;

    return DrizzleCustomerRepository.toDomain(row);
  }

  async findByEmail(email: Email): Promise<Customer | null> {
    const [row] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.email, email.value));

    if (!row) return null;

    return DrizzleCustomerRepository.toDomain(row);
  }

  async findAll(filters: CustomerFilters): Promise<Customer[]> {
    const conditions: SQL[] = [];

    if (filters?.isActive !== undefined) {
      conditions.push(eq(customers.isActive, filters.isActive));
    }

    if (filters.search?.trim()) {
      const search = `%${filters.search.trim()}%`;

      conditions.push(
        or(
          ilike(customers.firstName, search),
          ilike(customers.lastName, search),
          ilike(customers.email, search),
        )!,
      );
    }

    const rows =
      conditions.length > 0
        ? await this.db
            .select()
            .from(customers)
            .where(and(...conditions))
        : await this.db.select().from(customers);

    return rows.map(DrizzleCustomerRepository.toDomain);
  }

  async delete(id: CustomerId): Promise<void> {
    await this.db.delete(customers).where(eq(customers.id, id.value));
  }

  private static toPersistence(customer: Customer): CustomerRow {
    return {
      id: customer.id.value,
      email: customer.email.value,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      preferencesCurrency: customer.preferences.currency.value,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  private static toDomain(row: CustomerRow): Customer {
    return Customer.reconstitute({
      id: new CustomerId(row.id),
      email: Email.create(row.email),
      firstName: row.firstName,
      lastName: row.lastName,
      isActive: row.isActive,
      preferences: CustomerPreferences.create({
        currency: row.preferencesCurrency,
      }),
      phone: row.phone,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
