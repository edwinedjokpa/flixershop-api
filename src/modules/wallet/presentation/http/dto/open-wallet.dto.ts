import { Transform } from 'class-transformer';
import {
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class OpenWalletRequestDto {
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}$/, {
    message: 'currency must be a 3-letter uppercase currency code',
  })
  @IsISO4217CurrencyCode()
  currency: string;
}

export class OpenWalletResponseDto {
  id: string;
}
