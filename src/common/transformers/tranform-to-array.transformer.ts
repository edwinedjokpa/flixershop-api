import { Transform } from 'class-transformer';

export function TransformToArray() {
  return Transform(({ value }) => {
    if (value === undefined || value === null) return value;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string')
      return value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    return [value];
  });
}
