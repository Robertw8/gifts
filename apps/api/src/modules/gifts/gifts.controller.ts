import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListGiftsDto } from './dto/list-gifts.dto';
import { GiftsService } from './gifts.service';

@Controller('gifts')
export class GiftsController {
  constructor(private readonly gifts: GiftsService) {}

  @Get()
  findAll(@Query() query: ListGiftsDto) {
    return this.gifts.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gifts.findOne(id);
  }
}
