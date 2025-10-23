import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const isDev = process.env.NODE_ENV === 'development';
    const isTest = process.env.NODE_ENV === 'test';
    const isProd = process.env.NODE_ENV === 'production';

    // Prefer single DATABASE_URL if provided (e.g., Render managed Postgres)
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      return {
        type: 'postgres',
        url: databaseUrl,
        entities: [__dirname + '/../**/*.entity.js'],
        autoLoadEntities: true,
        synchronize: process.env.DB_SYNCHRONIZE === 'true' || isDev || isTest,
        logging: isDev,
        // In many hosted environments SSL is required
        ssl:
          process.env.DB_SSL === 'true' || isProd
            ? { rejectUnauthorized: false }
            : false,
      } as TypeOrmModuleOptions;
    }

    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'crypto_card_db',
      entities: [__dirname + '/../**/*.entity.js'],
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNCHRONIZE === 'true' || isDev || isTest,
      logging: isDev,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    } as TypeOrmModuleOptions;
  },
);
