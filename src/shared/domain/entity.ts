import { UniqueId } from './value-objects/unique-id.vo.js';

export abstract class Entity<T extends UniqueId = UniqueId> {
  constructor(protected readonly _id: T) {}

  equals(other: Entity<T>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    return this._id.equals(other._id);
  }

  get id(): T {
    return this._id;
  }
}
