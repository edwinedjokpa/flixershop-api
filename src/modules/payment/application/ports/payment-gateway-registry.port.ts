import { PaymentProviderName } from '../../domain/constants/payment-provider.constants.js';
import { PaymentGateway } from './payment-gateway.port.js';

export const PAYMENT_GATEWAY_REGISTRY = Symbol('PAYMENT_GATEWAY_REGISTRY');

export interface PaymentGatewayRegistryPort {
  get(provider: PaymentProviderName): PaymentGateway;
}
