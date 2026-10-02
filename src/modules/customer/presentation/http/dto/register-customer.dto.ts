import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class PreferencesDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
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
