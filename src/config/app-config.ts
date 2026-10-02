const database = process.env.DATABASE ?? 'postgres';

if (database !== 'mongodb' && database !== 'postgres') {
  throw new Error(`Invalid DATABASE configuration: ${database}`);
}

process.env.TZ = 'UTC';

export const appConfig = {
  database,
  timezone: 'UTC',
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appName: process.env.APP_NAME,
  frontendUrl: process.env.FRONTEND_URL,
  currency: process.env.CURRENCY ?? 'USD',
} as const;
