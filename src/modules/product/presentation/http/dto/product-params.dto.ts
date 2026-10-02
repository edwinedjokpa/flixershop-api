import { IsUUID } from 'class-validator';

export class ProductParamsDto {
  @IsUUID()
  id: string;
}
