import { Module } from '@nestjs/common';
import { LoggingModule } from './infrastructure/logging/logging.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { NotificationModule } from './infrastructure/notification/notification.module.js';

@Module({
  imports: [DatabaseModule, LoggingModule, NotificationModule],
  providers: [],
})
export class SharedModule {}
