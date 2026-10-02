import { OrderCancelledHandler } from './order-cancelled.handler.js';
import { OrderConfirmedHandler } from './order-confirmed.handler.js';
import { OrderDeliveredHandler } from './order-delivered.handler.js';
import { OrderPlacedHandler } from './order-placed.handler.js';
import { OrderShippedHandler } from './order-shipped.handler.js';

export const EventHandlers = [
  OrderPlacedHandler,
  OrderCancelledHandler,
  OrderConfirmedHandler,
  OrderShippedHandler,
  OrderDeliveredHandler,
];
