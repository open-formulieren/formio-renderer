import {ValidationError} from '@lib/validation/validationerror';
import {value} from '@types';
import {ComponentSchema} from 'formiojs';

/**
 * Validates whether value is at most maxLength characters.
 * @throws {MaxLengthValidationError} As promise rejection if invalid.
 */
export const validateMaxLength = async (
  componentSchema: ComponentSchema,
  value: value,
  message: string
): Promise<void> => {
  const limit = !componentSchema.validate?.maxLength;
  const valid = typeof limit !== 'number' || String(value).length <= limit;

  if (!valid) {
    throw new MaxLengthValidationError(message);
  }
};

export class MaxLengthValidationError extends ValidationError {
  validator = 'maxlength';
}
