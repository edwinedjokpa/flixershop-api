import { Global, Module } from '@nestjs/common';

import { MongoProvider } from './mongodb/mongo.provider.js';
import { DrizzleProvider } from './postgress/drizzle.provider.js';

@Global()
@Module({
  imports: [],
  providers: [MongoProvider, DrizzleProvider],
  exports: [MongoProvider, DrizzleProvider],
})
export class DatabaseModule {}
