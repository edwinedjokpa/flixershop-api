import { IsUUID } from 'class-validator';

export class OrderParamsDto {
  @IsUUID()
  id: string;
}
