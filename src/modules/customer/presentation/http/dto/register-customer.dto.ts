import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class PreferencesDto {
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}$/, {
    message: 'currency must be a 3-letter uppercase currency code',
  })
  @IsISO4217CurrencyCode()
  currency: string;
}

export class RegisterCustomerDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences: PreferencesDto;
}
