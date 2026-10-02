import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { formatValidationErrors } from './common/utils/format-validation-errors.util.js';
import { Logger } from 'nestjs-pino';
import { appConfig } from './config/app-config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const logger = app.get(Logger);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          errors: formatValidationErrors(errors),
        }),
    }),
  );

  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);

  logger.log(`Application is running with DATABASE: ${appConfig.database}`);
  logger.log(`Application is running with NODE_ENV: ${appConfig.nodeEnv}`);
  logger.log(`Application is running with TIMEZONE: ${appConfig.timezone}`);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
await bootstrap();
