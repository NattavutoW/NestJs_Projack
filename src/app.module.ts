import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { DatabaseModule } from './database/database.module';
import { RedisCacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import {BullModule} from '@nestjs/bull'
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ProductModule,
    DatabaseModule.forRootMultiple(), // ✅ โหลดฐานข้อมูลอัตโนมัติจาก `.env`
    RedisCacheModule,
    AuthModule,
    OrderModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Registering LoggerMiddleware globally
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Use '*' to apply it to all routes
  }
}
