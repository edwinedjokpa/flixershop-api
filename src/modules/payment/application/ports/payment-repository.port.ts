import { Payment } from '../../domain/entities/payment.entity.js';
import { PaymentId } from '../../domain/value-objects/payment-id.vo.js';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: PaymentId): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment | null>;
}
