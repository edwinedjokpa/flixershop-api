import { Currency } from '@/shared/domain/value-objects/currency.vo.js';

interface CustomerPreferencesProps {
  currency: string;
}

export class CustomerPreferences {
  private constructor(private readonly _currency: Currency) {}

  static create(props: CustomerPreferencesProps): CustomerPreferences {
    const currency = Currency.create(props.currency);
    return new CustomerPreferences(currency);
  }

  get currency(): Currency {
    return this._currency;
  }
}
