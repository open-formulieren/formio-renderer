import {ValidationError} from '@lib/validation/validationerror';
import {value} from '@types';
import {ComponentSchema} from 'formiojs';

/**
 * Validates whether value is truthy when component is required.
 * @throws {RequiredValidationError} As promise rejection if invalid.
 */
export const validateRequired = async (
  componentProps: ComponentSchema,
  value: value,
  message: string
): Promise<void> => {
  const required = componentProps.validate?.required;
  const valid = Boolean(!required || value);

  if (!valid) {
    throw new RequiredValidationError(message);
  }
};

export class RequiredValidationError extends ValidationError {
  validator = 'required';
}
