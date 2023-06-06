import {substitute} from '@lib/format';
import {ValidationError} from '@lib/validation/validationerror';
import {Value} from '@types';
import {ExtendedComponentSchema} from 'formiojs';

/**
 * Validates whether value is at least minLength characters.
 * @throws {MinLengthValidationError} As promise rejection if invalid.
 */
export const validateMinLength = async (
  component: ExtendedComponentSchema,
  value: Value,
  message: string
): Promise<void> => {
  const length = String(value).length;
  const limit = component.validate?.minLength;
  const valid = typeof limit !== 'number' || length >= limit;

  if (!valid) {
    throw new MinLengthValidationError(substitute(message, {...component, length, limit, value}));
  }
};

export class MinLengthValidationError extends ValidationError {
  name = 'minlength';
}
