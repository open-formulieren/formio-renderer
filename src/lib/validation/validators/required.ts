import {substitute} from '@lib/format';
import {ValidationError} from '@lib/validation/validationerror';
import {Value} from '@types';
import {ExtendedComponentSchema} from 'formiojs';

/**
 * Validates whether value is truthy when component is required.
 * @throws {RequiredValidationError} As promise rejection if invalid.
 */
export const validateRequired = async (
  componentProps: ExtendedComponentSchema,
  value: Value,
  message: string
): Promise<void> => {
  const required = componentProps.validate?.required;
  const valid = Boolean(!required || value);

  if (!valid) {
    throw new RequiredValidationError(substitute(message, {...componentProps, value}));
  }
};

export class RequiredValidationError extends ValidationError {
  validator = 'required';
}
