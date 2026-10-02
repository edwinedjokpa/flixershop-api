import { PlaceOrderHandler } from './place-order/place-order.handler.js';
import { CancelOrderHandler } from './cancel-order/cancel-order.handler.js';
import { ConfirmOrderHandler } from './confirm-order/confirm-order.handler.js';
import { ShipOrderHandler } from './ship-order/ship-order.handler.js';
import { DeliverOrderHandler } from './deliver-order/deliver-order.handler.js';

export const CommandHandlers = [
  PlaceOrderHandler,
  CancelOrderHandler,
  ConfirmOrderHandler,
  ShipOrderHandler,
  DeliverOrderHandler,
];
