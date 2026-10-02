import { PaymentProviderName } from '@/modules/payment/domain/constants/payment-provider.constants.js';
import { IsEnum, IsOptional, IsUrl, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsEnum(PaymentProviderName)
  provider: PaymentProviderName;

  @IsOptional()
  @IsUrl({ require_tld: false })
  successUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  cancelUrl?: string;
}
