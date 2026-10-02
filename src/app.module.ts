import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpClientModule } from '@nestjs/http-client';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { createKeyv } from '@keyv/redis';

import { LoggingModule } from './shared/infrastructure/logging/logging.module.js';
import { DatabaseModule } from './shared/infrastructure/database/database.module.js';
import { NotificationModule } from './shared/infrastructure/notification/notification.module.js';
import { ProductModule } from './modules/product/product.module.js';
import { CustomerModule } from './modules/customer/customer.module.js';
import { OrderModule } from './modules/order/order.module.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { ExcludeNullInterceptor } from './common/interceptors/exclude-null.interceptor.js';
import { PaymentModule } from './modules/payment/payment.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('REDIS_URL');
        const cacheTTLMs = 60 * 60 * 1000;
        return {
          stores: [createKeyv(redisUrl)],
          ttl: cacheTTLMs,
        };
      },
      inject: [ConfigService],
    }),
    HttpClientModule.register({ isGlobal: true, timeout: 15_000 }),
    LoggingModule,
    DatabaseModule,
    NotificationModule,
    ProductModule,
    CustomerModule,
    OrderModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ExcludeNullInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
