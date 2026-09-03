import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BalanceTransactionStatus, BalanceTransactionType } from '@prisma/client';
import { serializeUser } from '../../common/serializers';
import { PrismaService } from '../prisma/prisma.service';

export interface TelegramIdentity {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  upsertTelegramUser(identity: TelegramIdentity) {
    const developmentBonusEnabled =
      this.config.get<string>('NODE_ENV', 'development') !== 'production'
      && this.config.get<boolean>('ENABLE_DEVELOPMENT_BONUS', false);
    const welcomeBonus = developmentBonusEnabled
      ? String(this.config.get<string | number>('DEVELOPMENT_BONUS_AMOUNT', 0))
      : '0';
    return this.prisma.user.upsert({
      where: { telegramId: BigInt(identity.id) },
      create: {
        telegramId: BigInt(identity.id),
        firstName: identity.first_name,
        lastName: identity.last_name,
        username: identity.username,
        avatarUrl: identity.photo_url,
        balance: welcomeBonus,
        ...(Number(welcomeBonus) > 0 ? {
          balanceTransactions: {
            create: {
              type: BalanceTransactionType.BONUS,
              amount: welcomeBonus,
              status: BalanceTransactionStatus.COMPLETED,
            },
          },
        } : {}),
      },
      update: {
        firstName: identity.first_name,
        lastName: identity.last_name,
        username: identity.username,
        avatarUrl: identity.photo_url,
      },
    });
  }

  async findById(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }

  toResponse(user: Awaited<ReturnType<UsersService['findById']>>) {
    return serializeUser(user);
  }
}
