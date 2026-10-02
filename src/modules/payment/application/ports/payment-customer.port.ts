export const PAYMENT_CUSTOMER = Symbol('PAYMENT_CUSTOMER');

export interface PaymentCustomer {
  email: string;
  name?: string;
}

export interface PaymentCustomerPort {
  getByOrderId(orderId: string): Promise<PaymentCustomer | null>;
}
