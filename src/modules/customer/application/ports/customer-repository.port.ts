import { Customer } from '../../domain/entities/customer.entity.js';
import { CustomerId } from '../../domain/value-objects/customer-id.vo.js';
import { Email } from '../../domain/value-objects/email.vo.js';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerFilters {
  isActive?: boolean;
  search?: string;
}

export interface CustomerRepository {
  save(customer: Customer): Promise<void>;
  findById(id: CustomerId): Promise<Customer | null>;
  findByEmail(email: Email): Promise<Customer | null>;
  findAll(filters: CustomerFilters): Promise<Customer[]>;
  delete(id: CustomerId): Promise<void>;
}
