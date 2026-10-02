import { TransformBoolean } from '@/common/transformers/transform-boolean.transformer.js';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ListCustomersDto {
  @IsBoolean()
  @IsOptional()
  @TransformBoolean()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}
