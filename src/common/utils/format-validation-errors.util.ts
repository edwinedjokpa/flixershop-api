import { ValidationError } from 'class-validator';

export interface FormattedValidationErrors {
  [key: string]:
    string[] | FormattedValidationErrors | FormattedValidationErrors[];
}

export function formatValidationErrors(
  errors: ValidationError[],
): FormattedValidationErrors {
  return Object.fromEntries(
    errors.map((error) => {
      if (!error.children?.length) {
        return [error.property, Object.values(error.constraints ?? {})];
      }

      const isArray = error.children.every((child) =>
        /^\d+$/.test(child.property),
      );

      if (isArray) {
        return [
          error.property,
          error.children
            .sort((a, b) => Number(a.property) - Number(b.property))
            .map((child) =>
              child.children?.length
                ? formatValidationErrors(child.children)
                : Object.values(child.constraints ?? {}),
            ),
        ];
      }

      return [error.property, formatValidationErrors(error.children)];
    }),
  );
}
