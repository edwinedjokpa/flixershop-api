import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreatePaymentCommand } from './create-payment.command.js';
import {
  PAYMENT_REPOSITORY,
  type PaymentRepository,
} from '../../ports/payment-repository.port.js';
import {
  ORDER_PRICING,
  type OrderPricingPort,
} from '../../ports/order-pricing.port.js';
import { Payment } from '@/modules/payment/domain/entities/payment.entity.js';
import {
  OrderAlreadyPaidException,
  OrderPricingNotFoundException,
  PaymentCustomerNotFoundException,
} from '@/modules/payment/domain/exceptions/payment.exception.js';
import {
  PAYMENT_GATEWAY_REGISTRY,
  type PaymentGatewayRegistryPort,
} from '../../ports/payment-gateway-registry.port.js';
import {
  PAYMENT_CUSTOMER,
  type PaymentCustomerPort,
} from '../../ports/payment-customer.port.js';

interface CreatePaymentResponse {
  checkoutUrl: string;
  paymentId: string;
}

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler implements ICommandHandler<
  CreatePaymentCommand,
  CreatePaymentResponse
> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    @Inject(PAYMENT_CUSTOMER)
    private readonly paymentCustomer: PaymentCustomerPort,
    @Inject(PAYMENT_GATEWAY_REGISTRY)
    private readonly gatewayRegistry: PaymentGatewayRegistryPort,
    @Inject(ORDER_PRICING)
    private readonly orderPricing: OrderPricingPort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreatePaymentCommand): Promise<CreatePaymentResponse> {
    const { props } = command;

    const existing = await this.paymentRepository.findByOrderId(props.orderId);
    if (existing?.isSucceeded()) {
      throw new OrderAlreadyPaidException(props.orderId);
    }

    const pricing = await this.orderPricing.getOrderPricing(props.orderId);
    if (!pricing) {
      throw new OrderPricingNotFoundException(props.orderId);
    }

    const customer = await this.paymentCustomer.getByOrderId(props.orderId);
    if (!customer) {
      throw new PaymentCustomerNotFoundException();
    }

    let payment: Payment;
    if (existing) {
      payment = this.eventPublisher.mergeObjectContext(existing);
    } else {
      payment = this.eventPublisher.mergeObjectContext(
        Payment.initiate({
          orderId: props.orderId,
          money: pricing.total,
          provider: props.provider,
        }),
      );
    }

    const gateway = this.gatewayRegistry.get(props.provider);

    const checkout = await gateway.initiatePayment({
      customer: {
        email: customer.email,
        name: customer.name,
      },
      lines: pricing.lines,
      metadata: {
        orderId: props.orderId,
        paymentId: payment.id.value,
      },
    });

    payment.startCheckout();
    await this.paymentRepository.save(payment);

    payment.commit();
    return { paymentId: payment.id.value, checkoutUrl: checkout.url };
  }
}
