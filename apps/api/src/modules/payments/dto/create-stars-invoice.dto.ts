import { IsInt, Max, Min } from 'class-validator';

export class CreateStarsInvoiceDto {
  @IsInt()
  @Min(1)
  @Max(10_000)
  starCount: number;
}
