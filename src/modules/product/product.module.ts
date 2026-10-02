import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from './application/ports/product.repository.port.js';
import { DrizzleProductRepository } from './infrastructure/persistence/drizzle-product.repository.js';
import { MongoProductRepository } from './infrastructure/persistence/mongo-product.repository.js';
import { ConfigService } from '@nestjs/config';
import { ProductController } from './presentation/http/controllers/product.controller.js';
import { CommandHandlers } from './application/commands/index.js';
import { QueryHandlers } from './application/queries/index.js';

@Module({
  imports: [],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    MongoProductRepository,
    DrizzleProductRepository,
    {
      provide: PRODUCT_REPOSITORY,
      useFactory: (
        configService: ConfigService,
        mongoRepo: MongoProductRepository,
        drizzleRepo: DrizzleProductRepository,
      ) => {
        return configService.get('DATABASE') === 'mongodb'
          ? mongoRepo
          : drizzleRepo;
      },
      inject: [ConfigService, MongoProductRepository, DrizzleProductRepository],
    },
  ],
  controllers: [ProductController],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductModule {}
