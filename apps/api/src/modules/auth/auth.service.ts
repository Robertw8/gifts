import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { UsersService, type TelegramIdentity } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  validateInitData(initData: string, nowSeconds = Math.floor(Date.now() / 1000)): TelegramIdentity {
    const params = new URLSearchParams(initData);
    const receivedHash = params.get('hash');
    const authDate = Number(params.get('auth_date'));
    const userJson = params.get('user');

    if (!receivedHash || !Number.isInteger(authDate) || !userJson) {
      throw new BadRequestException('Telegram init data is incomplete');
    }

    const dataCheckString = [...params.entries()]
      .filter(([key]) => key !== 'hash')
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const botToken = this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computedHash = createHmac('sha256', secretKey).update(dataCheckString).digest();
    const receivedHashBuffer = Buffer.from(receivedHash, 'hex');

    if (receivedHashBuffer.length !== computedHash.length || !timingSafeEqual(receivedHashBuffer, computedHash)) {
      throw new UnauthorizedException('Invalid Telegram signature');
    }

    const maxAge = this.config.get<number>('TELEGRAM_AUTH_MAX_AGE_SECONDS', 86_400);
    if (authDate > nowSeconds + 30 || nowSeconds - authDate > maxAge) {
      throw new UnauthorizedException('Telegram init data has expired');
    }

    let user: unknown;
    try {
      user = JSON.parse(userJson);
    } catch {
      throw new BadRequestException('Telegram user data is invalid');
    }

    if (!this.isTelegramIdentity(user)) throw new BadRequestException('Telegram user data is invalid');
    return user;
  }

  async authenticate(initData: string) {
    const identity = this.validateInitData(initData);
    const user = await this.users.upsertTelegramUser(identity);
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '7d');
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, telegramId: user.telegramId.toString() },
      { expiresIn: expiresIn as never },
    );
    return { accessToken, user: this.users.toResponse(user) };
  }

  private isTelegramIdentity(value: unknown): value is TelegramIdentity {
    if (!value || typeof value !== 'object') return false;
    const user = value as Record<string, unknown>;
    return Number.isSafeInteger(user.id) && typeof user.first_name === 'string' && user.first_name.length > 0;
  }
}
