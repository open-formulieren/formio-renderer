import { ValidationError } from '@lib/validation/validationerror'
import { IComponentProps } from '@types'

/**
 * Validates whether stringified value is at most maxLength characters.
 * @throws {MaxLengthValidationError} As promise rejection if invalid.
 */
export const validateMaxLength = async (
  componentProps: IComponentProps,
  message: string
): Promise<void> => {
  const value = String(componentProps.value)
  const maxLength = componentProps.component.validate?.maxLength || ''
  const length = value.length
  const limit = parseInt(maxLength as string)
  const valid = Boolean(isNaN(limit) || length <= limit)

  if (!valid) {
    throw new MaxLengthValidationError(message)
  }

  return
}

export class MaxLengthValidationError extends ValidationError {
  validator = 'maxlength'
}
