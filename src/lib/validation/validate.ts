import {ValidationError} from '@lib/validation/validationerror';
import {
  validateMaxLength,
  validateMinLength,
  validatePattern,
  validateRequired,
} from '@lib/validation/validators';
import {IFormioForm, IValues, Value} from '@types';
import {FormikErrors} from 'formik';
import {ExtendedComponentSchema, Utils} from 'formiojs';

export type validator = [
  (
    ExtendedComponentSchema: ExtendedComponentSchema,
    value: Value,
    message: string,
    values?: IValues
  ) => Promise<void>,
  string
];

export const DEFAULT_VALIDATORS: validator[] = [
  [validateMaxLength, 'Er zijn teveel karakters opgegeven.'],
  [validateMinLength, 'Er zijn te weinig karakters opgegeven.'],
  [validatePattern, 'De opgegeven waarde voldoet niet aan het formaat.'],
  [validateRequired, 'Het verplichte veld is niet ingevuld.'],
];

/**
 * Validates `form` and combines errors for each component.
 * TODO: Implement "scoring/thresholds" for validators (determine what errors to show in specific cases).
 * TODO: Implement translations.
 * TODO: implement interpolation in validation error messages.
 * @param form Formio form.
 * @param values The values to validate.
 * @param validators See `validate` for more information.
 * @return A promise which resolves (`void`) if all `values` are considered valid and rejects
 * (`FormikErrors<value>`) it is considered invalid.
 */
export const getFormErrors = async (
  form: IFormioForm,
  values: IValues,
  validators: validator[] = DEFAULT_VALIDATORS
): Promise<FormikErrors<Value> | void> => {
  try {
    await validateForm(form, values, validators);
    return;
  } catch (result) {
    // Convert the validation errors to messages.
    const entries = Object.entries(result).map(
      ([key, validationErrors]: [string, ValidationError[]]) => {
        const messages = validationErrors
          .map(validationError => validationError.message.trim())
          .join('\n');
        return [key, messages];
      }
    );

    return Object.fromEntries(entries);
  }
};

/**
 * Validates `form`.
 *
 * Finds each Formio component schema in `form` and validates matching `values` using `validators`.
 * If all validators resolve a form is considered valid and the returned `Promise` resolves.
 * If not: the returned `Promise` rejects with an object mapping component keys to (an array of)
 * `ValidationError`s.
 *
 * @param form Formio form.
 * @param values The values to validate.
 * @param validators See `validate` for more information.
 * @throws {ValidationError[]} As promise rejection if invalid.
 * @return A promise which resolves (`void`) if all `values` are considered valid and rejects
 * (`{[index: string]: ValidationError[]}`) it is considered invalid.
 */
export const validateForm = async (
  form: IFormioForm,
  values: IValues,
  validators = DEFAULT_VALIDATORS
): Promise<{[index: string]: ValidationError[]} | void> => {
  const errors = {};
  const promises = Object.entries(values).map(async ([key, value]) => {
    const component = Utils.getComponent(form.components, key, false);

    try {
      await validate(component, value as Value, values, validators);
    } catch (e) {
      errors[key] = e;
    }
  });

  await Promise.all(promises);
  if (Object.keys(errors).length) {
    return Promise.reject(errors);
  }
  return;
};

/**
 * Validates a component.
 *
 * Runs each function in `validators` and passing it `ExtendedComponentSchema` and `message`.
 * If all validators resolve a components is considered valid and the returned `Promise` resolves.
 * If not: the returned `Promise` rejects with an array of `ValidationError` (subclasses).
 *
 * @param ExtendedComponentSchema Formio component schema passed to each validator.
 * @param value The value to validate.
 * @param formValues All the form values.
 *
 * @param validators An array of `async function`/`string` tuples. The function being the validator
 * function, the string a message used to indicate an invalid value. Each validator is run in order.
 *
 *  The validator function is called with `ExtendedComponentSchema`, the `value` and the error `message`.
 *  The (async/sync) function should return a `Promise` which either resolves (valid) or rejects
 *  (invalid) with a (subclass of) `ValidationError` instantiated with `message`.
 *
 * @throws {ValidationError[]} As promise rejection if invalid.
 *
 * @return A promise which resolves (`void`) if `value` is considered valid and rejects
 * (`ValidationError[]`) it is considered invalid.
 */
export const validate = async (
  ExtendedComponentSchema: ExtendedComponentSchema,
  value: Value,
  formValues: IValues,
  validators = DEFAULT_VALIDATORS
): Promise<void> => {
  // Map all validators into an array of `Promise`s, implementing a catch handler building the
  // `errors` array.
  const errors: ValidationError[] = [];
  const promises = validators.map(async ([validatorFunction, message]) => {
    try {
      await validatorFunction(ExtendedComponentSchema, value, message, formValues);
    } catch (e) {
      errors.push(e);
    }
  });

  // Wait until all promises are completed. When so: check if the `errors` array contains items,
  // indicating that at least one validation error exists in the array.
  await Promise.all(promises);
  if (errors.length) {
    return Promise.reject(errors);
  }
  return Promise.resolve();
};
