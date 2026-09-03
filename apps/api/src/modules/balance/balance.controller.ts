import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/auth-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BalanceService } from './balance.service';

@Controller('balance')
@UseGuards(JwtAuthGuard)
export class BalanceController {
  constructor(private readonly balance: BalanceService) {}

  @Get()
  getBalance(@CurrentUser() user: AuthUser) {
    return this.balance.getForUser(user.id);
  }
}
