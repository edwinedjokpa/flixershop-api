import { Injectable } from '@nestjs/common';
import { StripePaymentGateway } from '../gateways/stripe.gateway.js';
import { PaystackPaymentGateway } from '../gateways/paystack.gateway.js';
import { PaymentGateway } from '../../application/ports/payment-gateway.port.js';
import { UnsupportedPaymentProviderException } from '../../domain/exceptions/payment-gateway.exception.js';
import { PaymentGatewayRegistryPort } from '../../application/ports/payment-gateway-registry.port.js';
import { PaymentProviderName } from '../../domain/constants/payment-provider.constants.js';
import { MonnifyPaymentGateway } from '../gateways/monnify.gateway.js';

@Injectable()
export class PaymentGatewayRegistry implements PaymentGatewayRegistryPort {
  constructor(
    private readonly stripe: StripePaymentGateway,
    private readonly paystack: PaystackPaymentGateway,
    private readonly monnify: MonnifyPaymentGateway,
  ) {}

  get(provider: PaymentProviderName): PaymentGateway {
    switch (provider) {
      case PaymentProviderName.Stripe:
        return this.stripe;
      case PaymentProviderName.Paystack:
        return this.paystack;
      case PaymentProviderName.Monnify:
        return this.monnify;
      default:
        throw new UnsupportedPaymentProviderException(provider);
    }
  }
}
