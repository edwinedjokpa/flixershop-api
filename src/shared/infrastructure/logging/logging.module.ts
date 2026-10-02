import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { appConfig } from '@/config/app-config.js';

const isProduction = appConfig.nodeEnv === 'production';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: isProduction ? 'info' : 'debug',
        transport: isProduction
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: true,
              },
            },
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            requestId: req.id,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
  ],
})
export class LoggingModule {}
