import { IsDecimal } from 'class-validator';

export class UpdateGiftPriceDto {
  @IsDecimal({ decimal_digits: '0,9' })
  price: string;
}
