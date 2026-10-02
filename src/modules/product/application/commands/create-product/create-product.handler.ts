import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from './create-product.command.js';
import { Inject } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../ports/product.repository.port.js';
import { Sku } from '@/modules/product/domain/value-objects/sku.vo.js';
import { ProductAlreadyExistsException } from '@/modules/product/domain/exceptions/product.exception.js';
import { Product } from '@/modules/product/domain/entities/product.entity.js';
import { ConfigService } from '@nestjs/config';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<
  CreateProductCommand,
  void
> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    private readonly config: ConfigService,
  ) {}

  async execute(command: CreateProductCommand): Promise<void> {
    const { props } = command;

    const existingBySku = await this.productRepository.findBySku(
      Sku.create(props.sku),
    );
    if (existingBySku) {
      throw new ProductAlreadyExistsException('sku', props.sku);
    }

    const existingByName = await this.productRepository.findByName(props.name);
    if (existingByName) {
      throw new ProductAlreadyExistsException('name', props.name);
    }

    const currency = this.config.getOrThrow<string>('CURRENCY');

    const product = Product.create({
      ...props,
      currency,
    });

    await this.productRepository.save(product);
  }
}
