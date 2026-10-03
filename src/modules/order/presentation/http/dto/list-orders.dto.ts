import { IsArray, IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { TransformToArray } from '@/common/transformers/tranform-to-array.transformer.js';
import {
  ORDER_STATUSES,
  OrderStatusName,
} from '@/modules/order/domain/constants/order.constants.js';

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
  @IsEnum(ORDER_STATUSES, { each: true })
  statuses?: OrderStatusName[];
}
