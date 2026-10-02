import { ApiMessage } from '@/common/decorators/api-message.decorator.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ProductResponseDto } from '../dto/product-response.dto.js';
import { CreateProductCommand } from '../../../application/commands/create-product/create-product.command.js';
import { ListProductsQuery } from '../../../application/queries/list-products/list-product.query.js';
import { ListProductsDto } from '../dto/list-products.dto.js';
import { ProductParamsDto } from '../dto/product-params.dto.js';
import { DeleteProductCommand } from '../../../application/commands/delete-product/delete-product.command.js';
import { ProductMapper } from '../mappers/product.mapper.js';
import { GetProductQuery } from '../../../application/queries/get-product/get-product.query.js';

@Controller({ path: 'products' })
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('Product created successfully')
  async createProduct(@Body() dto: CreateProductDto): Promise<void> {
    return await this.commandBus.execute(
      new CreateProductCommand({
        name: dto.name,
        description: dto.description,
        sku: dto.sku,
        basePrice: dto.basePrice,
        stock: dto.stock,
      }),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Products retrieved successfully')
  async listProducts(
    @Query() query: ListProductsDto,
  ): Promise<ProductResponseDto[]> {
    const products = await this.queryBus.execute(
      new ListProductsQuery({
        isActive: query.isActive,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
      }),
    );

    return ProductMapper.toResponseList(products);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Product retrieved successfully')
  async getProduct(
    @Param() params: ProductParamsDto,
  ): Promise<ProductResponseDto> {
    const product = await this.queryBus.execute(
      new GetProductQuery({
        productId: params.id,
      }),
    );

    return ProductMapper.toResponse(product);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param() params: ProductParamsDto): Promise<void> {
    return await this.commandBus.execute(
      new DeleteProductCommand({
        productId: params.id,
      }),
    );
  }
}
