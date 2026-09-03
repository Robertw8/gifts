import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/auth-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.id, dto.giftId);
  }

  @Get()
  findMine(@CurrentUser() user: AuthUser) {
    return this.orders.findForUser(user.id);
  }

  @Get('me')
  findMineLegacy(@CurrentUser() user: AuthUser) {
    return this.orders.findForUser(user.id);
  }
}
