import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/auth-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  findMine(@CurrentUser() user: AuthUser) {
    return this.inventory.findForUser(user.id);
  }

  @Get('me')
  findMineLegacy(@CurrentUser() user: AuthUser) {
    return this.inventory.findForUser(user.id);
  }
}
