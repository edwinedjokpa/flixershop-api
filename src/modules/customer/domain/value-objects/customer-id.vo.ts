import { UniqueId } from '@/shared/domain/value-objects/unique-id.vo.js';

export class CustomerId extends UniqueId {
  constructor(id?: string) {
    super(id);
  }
}
