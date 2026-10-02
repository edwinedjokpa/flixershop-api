import { UniqueId } from '@/shared/domain/value-objects/unique-id.vo.js';

export class PaymentId extends UniqueId {
  constructor(id?: string) {
    super(id);
  }
}
