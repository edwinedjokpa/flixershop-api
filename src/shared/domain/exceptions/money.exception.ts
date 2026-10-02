import { DomainException } from './domain.exception.js';

export class NegativeAmountException extends DomainException {
  constructor() {
    super({
      code: 'NEGATIVE_AMOUNT',
      message: 'Amount cannot be negative.',
    });
  }
}

export class InvalidMoneyMultiplierException extends DomainException {
  constructor(factor: number) {
    super({
      code: 'INVALID_MONEY_MULTIPLIER',
      message: `Money multiplication factor cannot be negative: ${factor}.`,
      details: {
        factor,
      },
    });
  }
}
