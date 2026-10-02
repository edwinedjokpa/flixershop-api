import { TransformBoolean } from '@/common/transformers/transform-boolean.transformer.js';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class ListProductsDto {
  @IsBoolean()
  @IsOptional()
  @TransformBoolean()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;
}
