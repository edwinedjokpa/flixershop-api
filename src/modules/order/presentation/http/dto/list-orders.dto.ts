import { IsArray, IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { OrderStatusValue } from '@/modules/order/domain/value-objects/order-status.vo.js';
import { TransformToArray } from '@/common/transformers/tranform-to-array.transformer.js';

export class ListOrdersDto {
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsEnum(OrderStatusValue, { each: true })
  statuses?: OrderStatusValue[];
}
