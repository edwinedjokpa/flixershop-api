import {
  ApplicationException,
  ApplicationExceptionStatus,
} from '@/shared/domain/exceptions/application.exception.js';
import { DomainException } from '@/shared/domain/exceptions/domain.exception.js';
import { Money } from '@/shared/domain/value-objects/money.vo.js';

export class InvalidOrderStatusException extends DomainException {
  constructor(status: string) {
    super({
      code: 'INVALID_ORDER_STATUS',
      message: `Invalid order status: ${status}.`,
    });
  }
}

export class InvalidOrderStatusTransitionException extends DomainException {
  constructor(props: { currentStatus: string; targetStatus: string }) {
    super({
      code: 'INVALID_ORDER_STATUS_TRANSITION',
      message: `Invalid order status transition: cannot transition from ${props.currentStatus} to ${props.targetStatus}.`,
    });
  }
}

export class EmptyOrderException extends DomainException {
  constructor() {
    super({
      code: 'EMPTY_ORDER',
      message: 'An order must contain at least one item.',
    });
  }
}

export class OrderNotFoundException extends ApplicationException {
  constructor(id: string) {
    super({
      code: 'ORDER_NOT_FOUND',
      message: `Order with ID ${id} not found.`,
      status: ApplicationExceptionStatus.NOT_FOUND,
    });
  }
}

export class TrackingNumberRequiredException extends DomainException {
  constructor() {
    super({
      code: 'TRACKING_NUMBER_REQUIRED',
      message: 'Tracking number is required for shipping.',
    });
  }
}

export class InvalidTrackingNumberException extends DomainException {
  constructor(value: string) {
    super({
      code: 'INVALID_TRACKING_NUMBER',
      message: `Invalid tracking number: "${value}". Expected format: FLX + 12 digits.`,
    });
  }
}

export class CancellationReasonRequiredException extends DomainException {
  constructor() {
    super({
      code: 'CANCELLATION_REASON_REQUIRED',
      message: 'A cancellation reason is required.',
    });
  }
}

export class InvalidOrderItemQuantityException extends DomainException {
  constructor(quantity: number) {
    super({
      code: 'INVALID_ORDER_ITEM_QUANTITY',
      message: `Order item quantity must be greater than 0. Received: ${quantity}.`,
      details: {
        quantity,
      },
    });
  }
}

export class DiscountExceedsItemSubtotalException extends DomainException {
  constructor(props: { discount: Money; itemSubtotal: Money }) {
    super({
      code: 'DISCOUNT_EXCEEDS_ITEM_SUBTOTAL',
      message: 'Discount cannot exceed item subtotal.',
      details: {
        discount: props.discount.amount.toString(),
        itemSubtotal: props.itemSubtotal.amount.toString(),
        currency: props.discount.currency,
      },
    });
  }
}

export class InvalidShippingAddressException extends DomainException {
  constructor(
    field: 'street' | 'city' | 'state' | 'zipCode' | 'country',
    message: string,
  ) {
    super({
      code: 'INVALID_SHIPPING_ADDRESS',
      message,
      details: {
        field,
      },
    });
  }
}
