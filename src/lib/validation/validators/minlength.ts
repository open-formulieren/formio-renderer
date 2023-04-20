import {ValidationError} from '@lib/validation/validationerror';
import {Value} from '@types';
import {ExtendedComponentSchema} from 'formiojs';

/**
 * Validates whether value is at least minLength characters.
 * @throws {MinLengthValidationError} As promise rejection if invalid.
 */
export const validateMinLength = async (
  ExtendedComponentSchema: ExtendedComponentSchema,
  value: Value,
  message: string
): Promise<void> => {
  const limit = ExtendedComponentSchema.validate?.minLength;
  const valid = typeof limit !== 'number' || String(value).length >= limit;

  if (!valid) {
    throw new MinLengthValidationError(message);
  }
};

export class MinLengthValidationError extends ValidationError {
  validator = 'minlength';
}
