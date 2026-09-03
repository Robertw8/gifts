import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'node:crypto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService Telegram validation', () => {
  const token = '123456789:abcdefghijklmnopqrstuvwxyz123456789';
  const config = { getOrThrow: () => token, get: (_key: string, fallback: unknown) => fallback } as unknown as ConfigService;
  const service = new AuthService(config, {} as JwtService, {} as UsersService);

  function sign(values: Record<string, string>) {
    const dataCheckString = Object.entries(values).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('\n');
    const secret = createHmac('sha256', 'WebAppData').update(token).digest();
    const hash = createHmac('sha256', secret).update(dataCheckString).digest('hex');
    return new URLSearchParams({ ...values, hash }).toString();
  }

  it('accepts correctly signed, fresh Telegram init data', () => {
    const user = JSON.stringify({ id: 12345, first_name: 'Ada', username: 'ada' });
    const result = service.validateInitData(sign({ auth_date: '1000', query_id: 'query', user }), 1050);
    expect(result).toEqual({ id: 12345, first_name: 'Ada', username: 'ada' });
  });

  it('rejects a modified signature', () => {
    const data = sign({ auth_date: '1000', user: JSON.stringify({ id: 1, first_name: 'Ada' }) });
    expect(() => service.validateInitData(data.replace('Ada', 'Eve'), 1050)).toThrow(UnauthorizedException);
  });

  it('rejects expired init data', () => {
    const data = sign({ auth_date: '1000', user: JSON.stringify({ id: 1, first_name: 'Ada' }) });
    expect(() => service.validateInitData(data, 100_000)).toThrow(UnauthorizedException);
  });

  it('rejects incomplete init data', () => {
    expect(() => service.validateInitData('auth_date=1000', 1050)).toThrow(BadRequestException);
  });
});
