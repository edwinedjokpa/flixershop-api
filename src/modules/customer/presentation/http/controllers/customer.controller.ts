import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterCustomerDto } from '../dto/register-customer.dto.js';
import { RegisterCustomerCommand } from '../../../application/commands/register-customer/register-customer.command.js';
import { ApiMessage } from '@/common/decorators/api-message.decorator.js';
import { ListCustomersQuery } from '../../../application/queries/list-customers/list-customers.query.js';
import { CustomerMapper } from '../mappers/customer.mapper.js';
import { CustomerResponseDto } from '../dto/customer-response.dto.js';
import { ListCustomersDto } from '../dto/list-customers.dto.js';
import { CustomerParamsDto } from '../dto/customer-param.dto.js';
import { GetCustomerQuery } from '../../../application/queries/get-customer/get-customer.query.js';
import { DeleteCustomerCommand } from '../../../application/commands/delete-customer/delete-customer.command.js';

@Controller({ path: 'customers' })
export class CustomerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('Account created successfully')
  async registerCustomer(@Body() dto: RegisterCustomerDto): Promise<void> {
    return await this.commandBus.execute(
      new RegisterCustomerCommand({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone ?? null,
        preferences: dto.preferences,
      }),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Customers retrieved successfully')
  async listCustomers(
    @Query() query: ListCustomersDto,
  ): Promise<CustomerResponseDto[]> {
    const customers = await this.queryBus.execute(
      new ListCustomersQuery({
        isActive: query.isActive,
        search: query.search,
      }),
    );

    return CustomerMapper.toResponseList(customers);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Customer retrieved successfully')
  async getCustomer(@Param() params: CustomerParamsDto) {
    const customer = await this.queryBus.execute(
      new GetCustomerQuery({ customerId: params.id }),
    );

    return CustomerMapper.toResponse(customer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCustomer(@Param() params: CustomerParamsDto) {
    return await this.commandBus.execute(
      new DeleteCustomerCommand({ customerId: params.id }),
    );
  }
}
