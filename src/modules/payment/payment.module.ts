import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderModule } from '../order/order.module.js';
import { CommandHandlers } from './application/commands/index.js';
import { PAYMENT_REPOSITORY } from './application/ports/payment-repository.port.js';
import { StripePaymentGateway } from './infrastructure/gateways/stripe.gateway.js';
import { ORDER_PRICING } from './application/ports/order-pricing.port.js';
import { OrderPricingAdapter } from './infrastructure/adapters/order-pricing.adapter.js';
import { MongoPaymentRepository } from './infrastructure/persistence/mongo-payment.repository.js';
import { DrizzlePaymentRepository } from './infrastructure/persistence/drizzle-payment.repository.js';
import { PaymentController } from './presentation/http/controllers/payment.controller.js';
import { PaystackPaymentGateway } from './infrastructure/gateways/paystack.gateway.js';
import { PaymentGatewayRegistry } from './infrastructure/adapters/payment-gateway.registry.js';
import { PAYMENT_GATEWAY_REGISTRY } from './application/ports/payment-gateway-registry.port.js';
import { CustomerModule } from '../customer/customer.module.js';
import { PAYMENT_CUSTOMER } from './application/ports/payment-customer.port.js';
import { PaymentCustomerAdapter } from './infrastructure/adapters/payment-customer.adapter.js';
import { MonnifyPaymentGateway } from './infrastructure/gateways/monnify.gateway.js';

@Module({
  imports: [OrderModule, CustomerModule],
  providers: [
    ...CommandHandlers,
    MongoPaymentRepository,
    DrizzlePaymentRepository,
    StripePaymentGateway,
    PaystackPaymentGateway,
    MonnifyPaymentGateway,
    {
      provide: PAYMENT_REPOSITORY,
      useFactory: (
        configService: ConfigService,
        mongoRepo: MongoPaymentRepository,
        drizzleRepo: DrizzlePaymentRepository,
      ) => {
        return configService.get('DATABASE') === 'mongodb'
          ? mongoRepo
          : drizzleRepo;
      },
      inject: [ConfigService, MongoPaymentRepository, DrizzlePaymentRepository],
    },
    {
      provide: PAYMENT_CUSTOMER,
      useClass: PaymentCustomerAdapter,
    },
    {
      provide: ORDER_PRICING,
      useClass: OrderPricingAdapter,
    },
    {
      provide: PAYMENT_GATEWAY_REGISTRY,
      useClass: PaymentGatewayRegistry,
    },
  ],
  controllers: [PaymentController],
  exports: [PAYMENT_GATEWAY_REGISTRY],
})
export class PaymentModule {}
