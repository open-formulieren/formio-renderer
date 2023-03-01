/**
 * Runs all frontend validators based on validate.
 * @param {boolean|number|string} value
 * @param {{maxLength: number, minLength: number, pattern: RegExp|string, required: boolean}} validate Form.io validation object.
 * @throws {ValidationError[]} As promise rejection if invalid.
 * @return {Promise<boolean>} Promise for true if valid.
 */
export const validate = async (
  value: boolean | number | string,
  validate: { maxLength: number; minLength: number; pattern: RegExp | string; required: boolean }
): Promise<boolean | void> => {
  const { maxLength, minLength, pattern, required } = validate
  const errors: ValidationError[] = []

  const promises = [
    await validateMaxLength(value, maxLength).catch((e) => errors.push(e)),
    await validateMinLength(value, minLength).catch((e) => errors.push(e)),
    await validatePattern(value, pattern).catch((e) => errors.push(e)),
    await validateRequired(value, required).catch((e) => errors.push(e))
  ]

  return Promise.all(promises).then(() => {
    if (errors.length) {
      return Promise.reject(errors)
    }
    return Promise.resolve(true)
  })
}

/**
 * Get thrown if validation fails.
 */
export class ValidationError extends Error {
  constructor(message = '') {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validates whether stringified value is at most maxLength characters.
 * @param {boolean|number|string} value Value to check.
 * @param {number|string} maxLength Maximum length.
 * @throws {MaxLengthValidationError} As promise rejection if invalid.
 * @return {Promise<boolean>} Promise for true if valid.
 */
export const validateMaxLength = async (
  value: boolean | number | string,
  maxLength: number | string
): Promise<boolean> => {
  const length = String(value).length
  const limit = parseInt(maxLength as string)
  const valid = Boolean(isNaN(limit) || length <= limit)

  if (!valid) {
    throw new MaxLengthValidationError(
      `Ensure that this value has at most ${limit} characters (is has ${length}).`
    )
  }
  return valid
}

export class MaxLengthValidationError extends ValidationError {
  validator = 'maxLength'
}

/**
 * Validates whether stringified value is at least minLength characters.
 * @param {boolean|number|string} value Value to check.
 * @param {number|string} minLength Minimum length.
 * @throws {MinLengthValidationError} As promise rejection if invalid.
 * @return {Promise<boolean>} Promise for true if valid.
 */
export const validateMinLength = async (
  value: boolean | number | string,
  minLength: number | string
): Promise<boolean> => {
  const length = String(value).length
  const limit = parseInt(minLength as string)
  const valid = Boolean(isNaN(limit) || length >= limit)

  if (!valid) {
    throw new MinLengthValidationError(
      `Ensure that this value has at least ${limit} characters (is has ${length}).`
    )
  }
  return valid
}

export class MinLengthValidationError extends ValidationError {
  validator = 'minLength'
}

/**
 * Validates whether stringified value matches a (RegExp) pattern.
 * @param {boolean|number|string} value Value to check.
 * @param {RegExp|string} pattern Regular expression.
 * @throws {PatternValidationError} As promise rejection if invalid.
 * @return {Promise<boolean>} Promise for true if valid.
 */
export const validatePattern = async (
  value: boolean | number | string,
  pattern: RegExp | string
): Promise<boolean> => {
  const valid = Boolean(!pattern || String(value).match(pattern))
  if (!valid) {
    throw new PatternValidationError('Enter a valid value.')
  }
  return valid
}

export class PatternValidationError extends ValidationError {
  validator = 'pattern'
}

/**
 * Validates whether value is truthy and required is true.
 * @param {boolean|number|string} value Value to check.
 * @param {boolean} required
 * @throws {RequiredValidationError} As promise rejection if invalid.
 * @return {Promise<boolean>} Promise for true if valid.
 */
export const validateRequired = async (
  value: boolean | number | string,
  required: boolean
): Promise<boolean> => {
  const valid = Boolean(!required || value)
  if (!valid) {
    throw new RequiredValidationError('Field is required.')
  }
  return valid
}

export class RequiredValidationError extends ValidationError {
  validator = 'required'
}
