import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
  expiresIn: process.env.JWT_EXPIRATION || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
