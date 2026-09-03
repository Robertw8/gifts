import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  TelegramFile,
  TelegramGift,
  TelegramOwnedGifts,
} from './telegram-bot-api.types';

interface TelegramBotApiResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

@Injectable()
export class TelegramBotApiService {
  constructor(private readonly config: ConfigService) {}

  async getAvailableGifts() {
    return this.call<{ gifts: TelegramGift[] }>('getAvailableGifts');
  }

  async getUserGifts(userId: number, offset = '', limit = 100) {
    return this.call<TelegramOwnedGifts>('getUserGifts', {
      user_id: userId,
      offset,
      limit,
    });
  }

  async sendGift(userId: number, giftId: string) {
    return this.call<true>('sendGift', { user_id: userId, gift_id: giftId });
  }

  async createInvoiceLink(payload: {
    title: string;
    description: string;
    invoicePayload: string;
    starCount: number;
  }) {
    return this.call<string>('createInvoiceLink', {
      title: payload.title,
      description: payload.description,
      payload: payload.invoicePayload,
      currency: 'XTR',
      prices: [{ label: payload.title, amount: payload.starCount }],
    });
  }

  async answerPreCheckoutQuery(id: string, ok: boolean, errorMessage?: string) {
    return this.call<true>('answerPreCheckoutQuery', {
      pre_checkout_query_id: id,
      ok,
      ...(errorMessage ? { error_message: errorMessage } : {}),
    });
  }

  async getFile(fileId: string) {
    return this.call<TelegramFile>('getFile', { file_id: fileId });
  }

  async downloadFile(fileId: string) {
    const file = await this.getFile(fileId);
    if (!file.file_path) throw new BadGatewayException('Telegram did not return a downloadable gift file');
    const response = await fetch(`${this.baseUrl}/file/bot${this.botToken}/${file.file_path}`);
    if (!response.ok) throw new BadGatewayException('Telegram gift artwork download failed');
    return {
      bytes: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get('content-type') ?? 'application/octet-stream',
    };
  }

  private async call<T>(method: string, payload: Record<string, unknown> = {}) {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/bot${this.botToken}/${method}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new BadGatewayException(`Telegram Bot API ${method} request failed`);
    }

    const result = await response.json().catch(() => null) as TelegramBotApiResponse<T> | null;
    if (!response.ok || !result?.ok || result.result === undefined) {
      throw new BadGatewayException(result?.description ?? `Telegram Bot API ${method} failed`);
    }
    return result.result;
  }

  private get botToken() {
    return this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
  }

  private get baseUrl() {
    return this.config.get<string>('TELEGRAM_BOT_API_URL', 'https://api.telegram.org').replace(/\/$/, '');
  }
}
