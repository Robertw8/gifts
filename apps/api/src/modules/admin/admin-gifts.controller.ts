import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGiftDto } from '../gifts/dto/create-gift.dto';
import { UpdateGiftDto } from '../gifts/dto/update-gift.dto';
import { GiftsService } from '../gifts/gifts.service';
import { AdminGuard } from './admin.guard';
import { UpdateGiftAvailabilityDto } from './dto/update-gift-availability.dto';
import { UpdateGiftPriceDto } from './dto/update-gift-price.dto';

@Controller('admin/gifts')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminGiftsController {
  constructor(private readonly gifts: GiftsService) {}

  @Post()
  create(@Body() dto: CreateGiftDto) {
    return this.gifts.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGiftDto) {
    return this.gifts.update(id, dto);
  }

  @Patch(':id/price')
  updatePrice(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGiftPriceDto) {
    return this.gifts.update(id, dto);
  }

  @Patch(':id/availability')
  updateAvailability(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGiftAvailabilityDto) {
    return this.gifts.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.gifts.remove(id);
  }
}
