import { ValidationError } from '@lib/validation/validationerror'
import { IComponentProps } from '@types'

/**
 * Validates whether stringified value matches the (RegExp) pattern.
 * @throws {PatternValidationError} As promise rejection if invalid.
 */
export const validatePattern = async (
  componentProps: IComponentProps,
  message: string
): Promise<void> => {
  const value = String(componentProps.value)
  const pattern = componentProps.component.validate?.pattern || ''
  const valid = Boolean(!pattern || value.match(pattern))

  if (!valid) {
    throw new PatternValidationError(message)
  }
  return
}

export class PatternValidationError extends ValidationError {
  validator = 'pattern'
}
