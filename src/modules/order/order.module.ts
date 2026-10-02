import { Module } from '@nestjs/common';
import { QueryHandlers } from './application/queries/index.js';
import { EventHandlers } from './application/events/index.js';
import { CommandHandlers } from './application/commands/index.js';
import { ORDER_REPOSITORY } from './application/ports/order-repository.port.js';
import { ConfigService } from '@nestjs/config';
import { MongoOrderRepository } from './infrastructure/persistence/mongo-order.repository.js';
import { DrizzleOrderRepository } from './infrastructure/persistence/drizzle-order.repository.js';
import { OrderController } from './presentation/http/controllers/order.controller.js';
import { CUSTOMER } from './application/ports/customer.port.js';
import { PRODUCT } from './application/ports/product.port.js';
import { CustomerAdapter } from './infrastructure/adapters/customer.adapter.js';
import { ProductAdapter } from './infrastructure/adapters/product.adapter.js';
import { CustomerModule } from '../customer/customer.module.js';
import { ProductModule } from '../product/product.module.js';
import { OrderFulfillmentSaga } from './application/saga/order-fulfilment.saga.js';
import { CURRENCY_EXCHANGE } from '../payment/application/ports/currency-exchange.port.js';
import { ExchangeRateAdapter } from '../payment/infrastructure/adapters/exchange-rate.adapter.js';

@Module({
  imports: [CustomerModule, ProductModule],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    OrderFulfillmentSaga,
    MongoOrderRepository,
    DrizzleOrderRepository,
    {
      provide: ORDER_REPOSITORY,
      useFactory: (
        configService: ConfigService,
        mongoRepo: MongoOrderRepository,
        drizzleRepo: DrizzleOrderRepository,
      ) => {
        return configService.get('DATABASE') === 'mongodb'
          ? mongoRepo
          : drizzleRepo;
      },
      inject: [ConfigService, MongoOrderRepository, DrizzleOrderRepository],
    },
    {
      provide: CUSTOMER,
      useClass: CustomerAdapter,
    },
    {
      provide: PRODUCT,
      useClass: ProductAdapter,
    },
    {
      provide: CURRENCY_EXCHANGE,
      useClass: ExchangeRateAdapter,
    },
  ],
  controllers: [OrderController],
  exports: [ORDER_REPOSITORY],
})
export class OrderModule {}
