import {ValidationError} from '@lib/validation/validationerror';
import {IComponentProps} from '@types';

/**
 * Validates whether value is truthy when component is required.
 * @throws {RequiredValidationError} As promise rejection if invalid.
 */
export const validateRequired = async (
  componentProps: IComponentProps,
  message: string
): Promise<void> => {
  const value = componentProps.value;
  const required = Boolean(componentProps.component.validate?.required);
  const valid = Boolean(!required || value);

  if (!valid) {
    throw new RequiredValidationError(message);
  }
  return;
};

export class RequiredValidationError extends ValidationError {
  validator = 'required';
}
