import {substitute} from '@lib/format';
import {ValidationError} from '@lib/validation/validationerror';
import {Value} from '@types';
import {ExtendedComponentSchema} from 'formiojs';

/**
 * Validates whether value is truthy when component is required.
 * @throws {RequiredValidationError} As promise rejection if invalid.
 */
export const validateRequired = async (
  component: ExtendedComponentSchema,
  value: Value,
  message: string
): Promise<void> => {
  const required = component.validate?.required;
  const valid = Boolean(!required || value);

  if (!valid) {
    throw new RequiredValidationError(substitute(message, {...component, value}));
  }
};

export class RequiredValidationError extends ValidationError {
  name = 'required';
}
