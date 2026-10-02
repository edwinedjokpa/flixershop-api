import { Currency } from '@/shared/domain/value-objects/currency.vo.js';

export const CUSTOMER = Symbol('CUSTOMER');

export interface CustomerData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferences: {
    currency: Currency;
  };
  phone: string | null;
}

export interface CustomerPort {
  exists(customerId: string): Promise<boolean>;
  findById(customerId: string): Promise<CustomerData | null>;
}
