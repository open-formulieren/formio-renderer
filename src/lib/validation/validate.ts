import {OF_MISSING_KEY} from '@lib/renderer';
import {ValidationError} from '@lib/validation/validationerror';
import {
  validateMaxLength,
  validateMinLength,
  validatePattern,
  validateRequired,
} from '@lib/validation/validators';
import {IFormioForm, IValues, Value, Values} from '@types';
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

type ErrorMap =
  | Record<string, string>
  | {
      [key: string]: ErrorMap;
    };

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
): Promise<FormikErrors<IValues> | void> => {
  try {
    await validateForm(form, values, validators);
    return;
  } catch (result) {
    const errors: FormikErrors<IValues> = {};
    // Convert the validation errors to messages.
    Object.entries(result).forEach(([key, validationErrors]: [string, ValidationError[]]) => {
      const [tail, ...bits] = key.split('.').reverse();
      let localErrorObject = errors as ErrorMap;
      // deep-assign errors
      bits.forEach(bit => {
        if (!localErrorObject[bit]) {
          localErrorObject[bit] = {};
        }
        localErrorObject = localErrorObject[bit] as ErrorMap;
      });
      const messages = validationErrors
        .map(validationError => validationError.message.trim())
        .join('\n');
      localErrorObject[tail] = messages;
    });
    return errors;
  }
};

const isSingleValue = (obj: IValues | Value | Values): obj is Value => {
  if (obj === null) return true; // typeof null === 'object'
  return typeof obj !== 'object';
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
  const errors: {[key: string]: Error} = {};

  // Collect all the components in the form definition so that each components set of
  // validators can run
  const componentsToValidate: ExtendedComponentSchema[] = [];
  Utils.eachComponent(form.components, (component: ExtendedComponentSchema) => {
    componentsToValidate.push(component);
  });

  // Run validation for all components in the form definition
  const promises = componentsToValidate.map(async component => {
    const key = component.key || OF_MISSING_KEY;
    // lodash.get like to support nested data structures/keys with dots
    // TODO: works only for objects right now
    // FIXME: types can be more complex, value of a file upload is not a scalar, but an
    // object!
    // FIXME: the accumulator casting is also less than ideal, it should be possible
    // to infer this correctly.
    const value = key.split('.').reduce((acc: Value | IValues, bit: string) => {
      if (Array.isArray(acc)) {
        throw new Error('Arrays not supported yet');
      }
      if (acc === null) return null;
      const nestedProp = (acc as IValues)[bit];
      if (isSingleValue(nestedProp)) {
        return nestedProp;
      }
      return nestedProp;
    }, values) as Value;

    try {
      await validate(component, value, values, validators);
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
