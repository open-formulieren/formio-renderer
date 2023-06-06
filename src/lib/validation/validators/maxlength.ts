import {substitute} from '@lib/format';
import {ValidationError} from '@lib/validation/validationerror';
import {Value} from '@types';
import {ExtendedComponentSchema} from 'formiojs';

/**
 * Validates whether value is at most maxLength characters.
 * @throws {MaxLengthValidationError} As promise rejection if invalid.
 */
export const validateMaxLength = async (
  component: ExtendedComponentSchema,
  value: Value,
  message: string
): Promise<void> => {
  const length = String(value).length;
  const limit = component.validate?.maxLength;
  const valid = typeof limit !== 'number' || length <= limit;

  if (!valid) {
    throw new MaxLengthValidationError(substitute(message, {...component, length, limit, value}));
  }
};

export class MaxLengthValidationError extends ValidationError {
  name = 'maxlength';
}
