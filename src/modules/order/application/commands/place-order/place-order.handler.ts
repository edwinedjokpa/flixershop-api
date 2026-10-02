import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { PlaceOrderCommand } from './place-order.command.js';
import { Inject } from '@nestjs/common';
import {
  ORDER_REPOSITORY,
  type OrderRepository,
} from '../../ports/order-repository.port.js';
import { CUSTOMER, type CustomerPort } from '../../ports/customer.port.js';
import { PRODUCT, type ProductPort } from '../../ports/product.port.js';
import { CustomerNotFoundException } from '@/modules/customer/domain/exceptions/customer.exception.js';
import { ProductNotFoundException } from '@/modules/product/domain/exceptions/product.exception.js';
import { OrderItem } from '@/modules/order/domain/entities/order-item.entity.js';
import { ShippingAddress } from '@/modules/order/domain/value-objects/shipping-address.vo.js';
import { Order } from '@/modules/order/domain/entities/order.entity.js';
import {
  CURRENCY_EXCHANGE,
  type CurrencyExchangePort,
} from '@/modules/payment/application/ports/currency-exchange.port.js';

@CommandHandler(PlaceOrderCommand)
export class PlaceOrderHandler implements ICommandHandler<
  PlaceOrderCommand,
  void
> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(CUSTOMER)
    private readonly customer: CustomerPort,
    @Inject(PRODUCT)
    private readonly product: ProductPort,
    @Inject(CURRENCY_EXCHANGE)
    private readonly currencyExchange: CurrencyExchangePort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: PlaceOrderCommand): Promise<void> {
    const { props } = command;

    const customer = await this.customer.findById(props.customerId);
    if (!customer) {
      throw new CustomerNotFoundException(props.customerId);
    }

    const orderCurrency = customer.preferences.currency;
    const items: OrderItem[] = [];

    for (const item of props.items) {
      const product = await this.product.findById(item.productId);
      if (!product) {
        throw new ProductNotFoundException(item.productId);
      }

      const unitPrice = product.basePrice.currency.equals(orderCurrency)
        ? product.basePrice
        : await this.currencyExchange.convert(product.basePrice, orderCurrency);

      items.push(
        OrderItem.create({
          productId: product.id,
          productName: product.name,
          unitPrice,
          quantity: item.quantity,
        }),
      );
    }

    const shippingAddress = ShippingAddress.create({
      street: props.shippingAddress.street,
      city: props.shippingAddress.city,
      state: props.shippingAddress.state,
      zipCode: props.shippingAddress.zipCode,
      country: props.shippingAddress.country,
    });

    const order = this.eventPublisher.mergeObjectContext(
      Order.place({
        customerId: props.customerId,
        currency: orderCurrency,
        items,
        shippingAddress,
        notes: props.notes,
      }),
    );

    await this.orderRepository.save(order);

    order.commit();
  }
}
