import { IsUUID } from 'class-validator';

export class WalletParamsDto {
  @IsUUID()
  id: string;
}
