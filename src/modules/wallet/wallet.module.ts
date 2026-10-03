import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CommandHandlers } from './application/commands/index.js';
import { QueryHandlers } from './application/queries/index.js';
import { EventHandlers } from './application/events/index.js';
import { MongoWalletRepository } from './infrastructure/persistence/mongo-wallet.repository.js';
import { DrizzleWalletRepository } from './infrastructure/persistence/drizzle-wallet.repository.js';
import { WALLET_REPOSITORY } from './application/ports/wallet-repository.port.js';
import { WalletController } from './presentation/http/controllers/wallet.controller.js';

@Module({
  imports: [],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    MongoWalletRepository,
    DrizzleWalletRepository,
    {
      provide: WALLET_REPOSITORY,
      useFactory: (
        configService: ConfigService,
        mongoRepo: MongoWalletRepository,
        drizzleRepo: DrizzleWalletRepository,
      ) => {
        return configService.get('DATABASE') === 'mongodb'
          ? mongoRepo
          : drizzleRepo;
      },
      inject: [ConfigService, MongoWalletRepository, DrizzleWalletRepository],
    },
  ],
  controllers: [WalletController],
  exports: [WALLET_REPOSITORY],
})
export class WalletModule {}
