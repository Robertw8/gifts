import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthUser } from '../../common/auth-user';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const allowedIds = new Set(
      this.config.get<string>('ADMIN_TELEGRAM_IDS', '').split(',').map((id) => id.trim()).filter(Boolean),
    );
    if (!allowedIds.has(request.user.telegramId)) throw new ForbiddenException('Admin access is required');
    return true;
  }
}
