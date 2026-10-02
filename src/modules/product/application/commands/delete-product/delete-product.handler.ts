import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteProductCommand } from './delete-product.command.js';
import { Inject } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../ports/product.repository.port.js';
import { ProductId } from '@/modules/product/domain/value-objects/product-id.vo.js';
import { ProductNotFoundException } from '@/modules/product/domain/exceptions/product.exception.js';

@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler implements ICommandHandler<
  DeleteProductCommand,
  void
> {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(command: DeleteProductCommand): Promise<void> {
    const { props } = command;

    const productId = new ProductId(props.productId);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(props.productId);
    }

    await this.productRepository.delete(productId);
  }
}
