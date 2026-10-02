import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { appConfig } from '@/config/app-config.js';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: appConfig.nodeEnv === 'development' ? 'debug' : 'info',
        transport:
          appConfig.nodeEnv === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,

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
