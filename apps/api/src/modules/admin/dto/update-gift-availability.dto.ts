import { IsInt, Min } from 'class-validator';

export class UpdateGiftAvailabilityDto {
  @IsInt()
  @Min(0)
  available: number;
}
