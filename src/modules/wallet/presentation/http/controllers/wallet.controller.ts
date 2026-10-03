import { OpenWalletCommand } from '@/modules/wallet/application/commands/open-wallet/open-wallet.command.js';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  OpenWalletRequestDto,
  OpenWalletResponseDto,
} from '../dto/open-wallet.dto.js';
import { ApiMessage } from '@/common/decorators/api-message.decorator.js';
import { GetCustomerWalletsQuery } from '@/modules/wallet/application/queries/get-customer-wallets/get-customer-wallets.query.js';
import { WalletMapper } from '../mappers/wallet.mapper.js';
import { WalletResponseDto } from '../dto/wallet-response.dto.js';
import { WalletParamsDto } from '../dto/wallet-params.dto.js';
import { GetWalletQuery } from '@/modules/wallet/application/queries/get-wallet/get-wallet.query.js';
import { CloseWalletCommand } from '@/modules/wallet/application/commands/close-wallet/close-wallet.command.js';
import { CustomerId } from '@/common/decorators/customer-id.decorator.js';

@Controller({ path: 'wallets' })
export class WalletController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('Wallet opened successfully')
  async openWallet(
    @CustomerId() customerId: string,
    @Body() dto: OpenWalletRequestDto,
  ): Promise<OpenWalletResponseDto> {
    return await this.commandBus.execute(
      new OpenWalletCommand({
        customerId,
        currency: dto.currency,
      }),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Wallets retrieved successfully')
  async listWallets(
    @CustomerId() customerId: string,
  ): Promise<WalletResponseDto[]> {
    const wallets = await this.queryBus.execute(
      new GetCustomerWalletsQuery({
        customerId,
      }),
    );

    return WalletMapper.toResponseList(wallets);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Wallet retrieved successfully')
  async getWallet(
    @CustomerId() customerId: string,
    @Param() params: WalletParamsDto,
  ): Promise<WalletResponseDto> {
    const wallet = await this.queryBus.execute(
      new GetWalletQuery({
        walletId: params.id,
        customerId,
      }),
    );
    return WalletMapper.toResponse(wallet);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiMessage('Wallet closed successfully')
  async closeWallet(
    @CustomerId() customerId: string,
    @Param() params: WalletParamsDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CloseWalletCommand({
        walletId: params.id,
        customerId,
      }),
    );
  }
}
