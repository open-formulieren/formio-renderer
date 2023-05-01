import {substitute} from '@lib/format';
import {ValidationError} from '@lib/validation/validationerror';
import {Value} from '@types';
import {ExtendedComponentSchema} from 'formiojs';

/**
 * Validates whether value is at least minLength characters.
 * @throws {MinLengthValidationError} As promise rejection if invalid.
 */
export const validateMinLength = async (
  componentProps: ExtendedComponentSchema,
  value: Value,
  message: string
): Promise<void> => {
  const length = String(value).length;
  const limit = componentProps.validate?.minLength;
  const valid = typeof limit !== 'number' || length >= limit;

  if (!valid) {
    throw new MinLengthValidationError(
      substitute(message, {...componentProps, length, limit, value})
    );
  }
};

export class MinLengthValidationError extends ValidationError {
  validator = 'minlength';
}
