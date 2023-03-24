import { ValidationError } from '@lib/validation/validationerror'
import {
  validateMaxLength,
  validateMinLength,
  validatePattern,
  validateRequired
} from '@lib/validation/validators'
import { IComponentProps } from '@types'

export type validator = [(component: IComponentProps, message: string) => Promise<void>, string]

export const DEFAULT_VALIDATORS: validator[] = [
  [validateMaxLength, 'Er zijn teveel karakters opgegeven.'],
  [validateMinLength, 'Er zijn te weinig karakters opgegeven.'],
  [validatePattern, 'De opgegeven waarde voldoet niet aan het formaat.'],
  [validateRequired, 'Het verplichte veld is niet ingevuld']
]

/**
 * Validates a component.
 *
 * Runs each function in `validators` and passing it `componentProps` and `message`.
 * If all validators resolve a components is considered valid and the returned `Promise` resolves.
 * If not: the returned `Promise` rejects with an array of `ValidationError` (subclasses).
 * @param {IComponentProps} componentProps Component properties are passed to each validator.
 *
 * @param {validator[]} validators An array of `async function`/`string` tuples. The function being
 *  the validator function, the string a message used to indicate an invalid value. Each validator
 *  is run in order.
 *
 *  The validator function is called with `componentProps` (containing the value) and the error
 *  `message`. The (async) function should return a `Promise` which either resolves (valid) or
 *  rejects (invalid) with a (subclass of) `ValidationError` instantiated with `message`.
 *
 * @throws {ValidationError[]} As promise rejection if invalid.
 *
 * @return {Promise<void>} A promise which resolves (`void`) if a component is considered valid and
 *  rejects (`ValidationError[]`) it is considered invalid.
 */
export const validate = async (
  componentProps: IComponentProps,
  validators = DEFAULT_VALIDATORS
): Promise<void> => {
  // Map all validators into an array of `Promise`s, implementing a catch handler building the
  // `errors` array.
  const errors: ValidationError[] = []
  const promises = validators.map(([validatorFunction, message]) =>
    validatorFunction(componentProps, message).catch((e: ValidationError) => errors.push(e))
  )

  // Wait until all promises are completed. When so: check if the `errors` array contains items,
  // indicating that at least one validation error exists in the array.
  return Promise.all(promises).then(() => {
    if (errors.length) {
      return Promise.reject(errors)
    }
    return Promise.resolve()
  })
}
