import { ApiMessage } from '@/common/decorators/api-message.decorator.js';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PlaceOrderDto } from '../dto/place-order.dto.js';
import { PlaceOrderCommand } from '@/modules/order/application/commands/place-order/place-order.command.js';
import { ListOrdersDto } from '../dto/list-orders.dto.js';
import { ListOrdersQuery } from '@/modules/order/application/queries/list-orders/list-orders.query.js';
import { OrderResponseDto } from '../dto/order-response.dto.js';
import { OrderMapper } from '../ mappers/order.mapper.js';
import { OrderParamsDto } from '../dto/order-params.dto.js';
import { GetOrderQuery } from '@/modules/order/application/queries/get-order/get-order.query.js';
import { ShipOrderCommand } from '@/modules/order/application/commands/ship-order/ship-order.command.js';
import { ConfirmOrderCommand } from '@/modules/order/application/commands/confirm-order/confirm-order.command.js';
import { CancelOrderCommand } from '@/modules/order/application/commands/cancel-order/cancel-order.command.js';
import { CancelOrderDto } from '../dto/cancel-order.dto.js';
import { DeliverOrderCommand } from '@/modules/order/application/commands/deliver-order/deliver-order.command.js';

@Controller({ path: 'orders' })
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiMessage('Order placed successfully')
  async placeOrder(@Body() dto: PlaceOrderDto) {
    return this.commandBus.execute(
      new PlaceOrderCommand({
        customerId: dto.customerId,
        items: dto.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: dto.shippingAddress,
      }),
    );
  }

  @Get()
  @HttpCode(200)
  @ApiMessage('Orders retrieved successfully')
  async findAll(@Query() query: ListOrdersDto): Promise<OrderResponseDto[]> {
    const orders = await this.queryBus.execute(
      new ListOrdersQuery({
        orderId: query.orderId,
        customerId: query.customerId,
        search: query.search,
        statuses: query.statuses,
      }),
    );

    return OrderMapper.toResponseList(orders);
  }

  @Get(':id')
  @HttpCode(200)
  @ApiMessage('Order retrieved successfully')
  async findOne(@Param() params: OrderParamsDto): Promise<OrderResponseDto> {
    const order = await this.queryBus.execute(
      new GetOrderQuery({ orderId: params.id }),
    );

    return OrderMapper.toResponse(order);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiMessage('Order cancelled successfully')
  async cancel(@Param() params: OrderParamsDto, @Body() dto: CancelOrderDto) {
    return await this.commandBus.execute(
      new CancelOrderCommand({
        orderId: params.id,
        reason: dto.reason,
      }),
    );
  }

  @Patch(':id/confirm')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiMessage('Order confirmed successfully')
  async confirmOrder(@Param() params: OrderParamsDto) {
    return await this.commandBus.execute(
      new ConfirmOrderCommand({
        orderId: params.id,
      }),
    );
  }

  @Patch(':id/ship')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiMessage('Order shipped successfully')
  async shipOrder(@Param() params: OrderParamsDto) {
    return await this.commandBus.execute(
      new ShipOrderCommand({
        orderId: params.id,
      }),
    );
  }

  @Patch(':id/deliver')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiMessage('Order delivered successfully')
  async deliverOrder(@Param() params: OrderParamsDto) {
    return await this.commandBus.execute(
      new DeliverOrderCommand({
        orderId: params.id,
      }),
    );
  }
}
