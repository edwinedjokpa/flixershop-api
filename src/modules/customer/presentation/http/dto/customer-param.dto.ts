import { IsUUID } from 'class-validator';

export class CustomerParamsDto {
  @IsUUID()
  id: string;
}
