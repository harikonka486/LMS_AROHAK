import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

export const DB_POOL = 'DB_POOL';

@Global()
@Module({
  providers: [
    {
      provide: DB_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        mysql.createPool({
          host: config.get('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          user: config.get('DB_USER', 'root'),
          password: config.get('DB_PASSWORD', ''),
          database: config.get('DB_NAME', 'lms_erp'),
          waitForConnections: true,
          connectionLimit: 10,
          timezone: '+00:00',
        }),
    },
  ],
  exports: [DB_POOL],
})
export class DatabaseModule {}
