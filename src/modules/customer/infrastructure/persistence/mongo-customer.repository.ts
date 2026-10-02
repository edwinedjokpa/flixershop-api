import { Injectable, Inject } from '@nestjs/common';
import { Collection, Db, Filter } from 'mongodb';
import { Customer } from '../../domain/entities/customer.entity.js';
import { MONGO_DB } from '@/shared/infrastructure/database/mongodb/mongo.provider.js';
import {
  CustomerFilters,
  type CustomerRepository,
} from '../../application/ports/customer-repository.port.js';
import { CustomerId } from '../../domain/value-objects/customer-id.vo.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { CustomerPreferences } from '../../domain/value-objects/preferences.vo.js';

type CustomerPreferenceData = { currency: string };

interface CustomerDocument {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  preferences: CustomerPreferenceData;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MongoCustomerRepository implements CustomerRepository {
  private readonly collection: Collection<CustomerDocument>;

  constructor(
    @Inject(MONGO_DB)
    private readonly db: Db,
  ) {
    this.collection = this.db.collection<CustomerDocument>('customers');
  }

  async save(customer: Customer): Promise<void> {
    const doc = MongoCustomerRepository.toPersistence(customer);

    await this.collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true },
    );
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const doc = await this.collection.findOne({ _id: id.value });

    if (!doc) return null;
    return MongoCustomerRepository.toDomain(doc);
  }

  async findByEmail(email: Email): Promise<Customer | null> {
    const doc = await this.collection.findOne({ email: email.value });

    if (!doc) return null;
    return MongoCustomerRepository.toDomain(doc);
  }

  async findAll(filters: CustomerFilters): Promise<Customer[]> {
    const query: Filter<CustomerDocument> = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.search?.trim()) {
      const search = filters.search.trim();
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const docs = await this.collection.find(query).toArray();
    return docs.map(MongoCustomerRepository.toDomain);
  }

  async delete(id: CustomerId): Promise<void> {
    await this.collection.deleteOne({ _id: id.value });
  }

  private static toPersistence(customer: Customer): CustomerDocument {
    return {
      _id: customer.id.value,
      email: customer.email.value,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      preferences: {
        currency: customer.preferences.currency.value,
      },
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  private static toDomain(doc: CustomerDocument): Customer {
    return Customer.reconstitute({
      id: new CustomerId(doc._id),
      email: Email.create(doc.email),
      firstName: doc.firstName,
      lastName: doc.lastName,
      phone: doc.phone,
      preferences: CustomerPreferences.create({
        ...doc.preferences,
      }),
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
