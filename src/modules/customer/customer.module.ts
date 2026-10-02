import { Module } from '@nestjs/common';
import { CommandHandlers } from './application/commands/index.js';
import { EventHandlers } from './application/events/index.js';
import { CUSTOMER_REPOSITORY } from './application/ports/customer-repository.port.js';
import { QueryHandlers } from './application/queries/index.js';
import { DrizzleCustomerRepository } from './infrastructure/persistence/drizzle-customer.repository.js';
import { ConfigService } from '@nestjs/config';
import { MongoCustomerRepository } from './infrastructure/persistence/mongo-customer.repository.js';
import { CustomerController } from './presentation/http/controllers/customer.controller.js';

@Module({
  imports: [],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    MongoCustomerRepository,
    DrizzleCustomerRepository,
    {
      provide: CUSTOMER_REPOSITORY,
      useFactory: (
        configService: ConfigService,
        mongoRepo: MongoCustomerRepository,
        drizzleRepo: DrizzleCustomerRepository,
      ) => {
        return configService.get('DATABASE') === 'mongodb'
          ? mongoRepo
          : drizzleRepo;
      },
      inject: [
        ConfigService,
        MongoCustomerRepository,
        DrizzleCustomerRepository,
      ],
    },
  ],
  controllers: [CustomerController],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomerModule {}
