import { Long } from 'mongodb';

export type MongoInt = Long | number | bigint;

export function toBigInt(value: MongoInt): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  return BigInt(value.toString());
}
