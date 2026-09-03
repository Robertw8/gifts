import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import Joi from 'joi';
import { AdminModule } from './modules/admin/admin.module';
import { BalanceModule } from './modules/balance/balance.module';
import { AuthModule } from './modules/auth/auth.module';
import { GiftsModule } from './modules/gifts/gifts.module';
import { HomeModule } from './modules/home/home.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { TelegramGiftsModule } from './modules/telegram-gifts/telegram-gifts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().uri().required(),
        TELEGRAM_BOT_TOKEN: Joi.string().min(20).required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        TELEGRAM_AUTH_MAX_AGE_SECONDS: Joi.number().integer().positive().default(86400),
        WEB_ORIGIN: Joi.string().default('http://localhost:5173'),
        ADMIN_TELEGRAM_IDS: Joi.string().allow('').default(''),
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        ENABLE_DEVELOPMENT_BONUS: Joi.boolean().truthy('true').falsy('false').default(false),
        DEVELOPMENT_BONUS_AMOUNT: Joi.number().min(0).default(1000),
        ENABLE_DEVELOPMENT_GIFT_FALLBACK: Joi.boolean().truthy('true').falsy('false').default(false),
        TELEGRAM_BOT_API_URL: Joi.string().uri().default('https://api.telegram.org'),
        TELEGRAM_WEBHOOK_SECRET: Joi.string().min(16).required(),
        INTERNAL_API_KEY: Joi.string().min(32).required(),
        PUBLIC_API_URL: Joi.string().uri().default('http://localhost:3000/api'),
        PORT: Joi.number().port().default(3000),
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('JWT_SECRET') }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GiftsModule,
    InventoryModule,
    OrdersModule,
    PaymentsModule,
    AdminModule,
    BalanceModule,
    HomeModule,
    TelegramGiftsModule,
  ],
})
export class AppModule {}
