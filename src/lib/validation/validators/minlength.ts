import { ValidationError } from '@lib/validation/validationerror'
import { IComponentProps } from '@types'

/**
 * Validates whether stringified value is at least minLength characters.
 * @throws {MinLengthValidationError} As promise rejection if invalid.
 */
export const validateMinLength = async (
  componentProps: IComponentProps,
  message: string
): Promise<void> => {
  const value = String(componentProps.value)
  const minLength = componentProps.component.validate?.minLength || ''
  const length = value.length
  const limit = parseInt(minLength as string)
  const valid = Boolean(isNaN(limit) || length >= limit)

  if (!valid) {
    throw new MinLengthValidationError(message)
  }
  return
}

export class MinLengthValidationError extends ValidationError {
  validator = 'minLength'
}
