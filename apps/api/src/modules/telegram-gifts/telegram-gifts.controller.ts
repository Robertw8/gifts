import { Controller, Get, Header, Param, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/auth-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TelegramGiftsService } from './telegram-gifts.service';

@Controller('telegram')
export class TelegramGiftsController {
  constructor(private readonly telegramGifts: TelegramGiftsService) {}

  @Get('gifts/me')
  @UseGuards(JwtAuthGuard)
  getMine(@CurrentUser() user: AuthUser) {
    return this.telegramGifts.getOwnedGifts(user.telegramId);
  }

  @Get('files/:fileId')
  @Header('Cache-Control', 'public, max-age=3600')
  async getFile(
    @Param('fileId') fileId: string,
    @Res({ passthrough: true }) response: { setHeader(name: string, value: string): void },
  ) {
    const file = await this.telegramGifts.downloadGiftFile(fileId);
    response.setHeader('Content-Type', file.contentType);
    return new StreamableFile(file.bytes);
  }
}
