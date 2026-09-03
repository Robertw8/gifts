import { ConfigService } from '@nestjs/config';
import { TelegramBotApiService } from './telegram-bot-api.service';

describe('TelegramBotApiService', () => {
  const fetchMock = jest.spyOn(global, 'fetch');
  const config = {
    getOrThrow: (key: string) => key === 'TELEGRAM_BOT_TOKEN' ? 'test-token' : undefined,
    get: (key: string, fallback: string) => key === 'TELEGRAM_BOT_API_URL' ? 'https://telegram.example.test' : fallback,
  } as unknown as ConfigService;
  const service = new TelegramBotApiService(config);

  beforeEach(() => fetchMock.mockReset());
  afterAll(() => fetchMock.mockRestore());

  it('uses the official gift methods and their required identifiers', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, result: { gifts: [] } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, result: { total_count: 0, gifts: [] } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, result: true }), { status: 200 }));

    await service.getAvailableGifts();
    await service.getUserGifts(12345);
    await service.sendGift(12345, 'telegram-gift-id');

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://telegram.example.test/bottest-token/getAvailableGifts',
      'https://telegram.example.test/bottest-token/getUserGifts',
      'https://telegram.example.test/bottest-token/sendGift',
    ]);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({ user_id: 12345, limit: 100 });
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toEqual({ user_id: 12345, gift_id: 'telegram-gift-id' });
  });

  it('creates an XTR invoice with exactly one price component and no provider token', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, result: 'https://t.me/invoice/test' }), { status: 200 }));
    await service.createInvoiceLink({
      title: '100 Marketplace Stars',
      description: 'Internal balance top-up',
      invoicePayload: 'stars:payment-id',
      starCount: 100,
    });
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body).toMatchObject({ currency: 'XTR', payload: 'stars:payment-id', prices: [{ label: '100 Marketplace Stars', amount: 100 }] });
    expect(body).not.toHaveProperty('provider_token');
  });
});
