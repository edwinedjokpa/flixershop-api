import { AggregateRoot } from '@/shared/domain/aggregate-root.js';
import { CustomerId } from '../value-objects/customer-id.vo.js';
import { Email } from '../value-objects/email.vo.js';
import { CustomerRegisteredEvent } from '../events/customer-registered.event.js';
import { CustomerPreferences } from '../value-objects/preferences.vo.js';

interface CustomerProps {
  id: CustomerId;
  email: Email;
  firstName: string;
  lastName: string;
  isActive: boolean;
  preferences: CustomerPreferences;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface RegisterCustomerProps {
  email: Email;
  firstName: string;
  lastName: string;
  phone: string | null;
  preferences: { currency: string };
}

export class Customer extends AggregateRoot {
  private readonly _id: CustomerId;
  private _email: Email;
  private _firstName: string;
  private _lastName: string;
  private _isActive: boolean;
  private _preferences: CustomerPreferences;
  private _phone: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: CustomerProps) {
    super();
    this._id = props.id;
    this._email = props.email;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._preferences = props.preferences;
    this._isActive = props.isActive;
    this._phone = props.phone;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static register({
    email,
    firstName,
    lastName,
    phone,
    preferences,
  }: RegisterCustomerProps): Customer {
    const id = new CustomerId();
    const now = new Date();

    const customer = new Customer({
      id,
      email,
      firstName,
      lastName,
      phone,
      preferences: CustomerPreferences.create(preferences),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    customer.apply(
      new CustomerRegisteredEvent({
        customerId: id.value,
        email: email.value,
        firstName,
      }),
    );

    return customer;
  }

  static reconstitute(props: CustomerProps): Customer {
    return new Customer(props);
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get id(): CustomerId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get preferences(): CustomerPreferences {
    return this._preferences;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get phone(): string | null {
    return this._phone;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
