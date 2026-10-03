export interface CurrencyMetadata {
  code: string;
  name: string;
  symbol: string;
  displaySymbol: string;
  decimalDigits: number;
}

export const CURRENCIES: Record<string, CurrencyMetadata> = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    displaySymbol: '₦',
    decimalDigits: 2,
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    displaySymbol: '$',
    decimalDigits: 2,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    displaySymbol: '€',
    decimalDigits: 2,
  },
  GBP: {
    code: 'GBP',
    name: 'Pound Sterling',
    symbol: '£',
    displaySymbol: '£',
    decimalDigits: 2,
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: '$',
    displaySymbol: 'CA$',
    decimalDigits: 2,
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: '$',
    displaySymbol: 'A$',
    decimalDigits: 2,
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    displaySymbol: '¥',
    decimalDigits: 0,
  },
  KRW: {
    code: 'KRW',
    name: 'South Korean Won',
    symbol: '₩',
    displaySymbol: '₩',
    decimalDigits: 0,
  },
  KWD: {
    code: 'KWD',
    name: 'Kuwaiti Dinar',
    symbol: 'د.ك',
    displaySymbol: 'د.ك',
    decimalDigits: 3,
  },
  BHD: {
    code: 'BHD',
    name: 'Bahraini Dinar',
    symbol: '.د.ب',
    displaySymbol: '.د.ب',
    decimalDigits: 3,
  },
};
