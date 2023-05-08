import {substitute} from '@lib/format';
import {ValidationError} from '@lib/validation/validationerror';
import {Value} from '@types';
import {ExtendedComponentSchema} from 'formiojs';

/**
 * Validates whether value matches the (RegExp) pattern.
 * @throws {PatternValidationError} As promise rejection if invalid.
 */
export const validatePattern = async (
  component: ExtendedComponentSchema,
  value: Value,
  message: string
): Promise<void> => {
  const pattern = component.validate?.pattern;
  const valid = Boolean(!pattern || String(value).match(new RegExp(pattern)));

  if (!valid) {
    throw new PatternValidationError(substitute(message, {...component, pattern, value}));
  }
};

export class PatternValidationError extends ValidationError {
  validator = 'pattern';
}
