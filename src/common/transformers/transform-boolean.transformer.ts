import { Transform } from 'class-transformer';

export function TransformBoolean() {
  return Transform(({ value }): boolean => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  });
}
