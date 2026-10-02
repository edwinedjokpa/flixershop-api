import { Module } from '@nestjs/common';
import { MongoModule } from './mongodb/mongo.module.js';
import { DrizzleModule } from './postgress/drizzle.module.js';

@Module({
  imports: [MongoModule, DrizzleModule],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
