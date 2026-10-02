import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { Currency } from '@/shared/domain/value-objects/currency.vo.js';

export const CURRENCY_EXCHANGE = Symbol('CURRENCY_EXCHANGE');

export interface CurrencyExchangePort {
  convert(money: Money, targetCurrency: Currency): Promise<Money>;
}
