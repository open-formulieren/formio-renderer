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
import _ from 'lodash';

export type Validator = [
  (
    ExtendedComponentSchema: ExtendedComponentSchema,
    value: Value,
    message: string,
    values?: IValues
  ) => Promise<void>,
  string
];

export const DEFAULT_VALIDATORS: Validator[] = [
  [validateMaxLength, '{{ label }} must have no more than {{ limit }} characters.'],
  [validateMinLength, '{{ label }} must have at least {{ limit }} characters.'],
  [validatePattern, '{{ label }} does not match the pattern {{ pattern }}'],
  [validateRequired, '{{ label }} is required'],
];

/**
 * Validates `form` and combines errors for each component.
 * TODO: Implement "scoring/thresholds" for validators (determine what errors to show in specific cases).
 * TODO: Implement translations.
 * TODO: implement interpolation in validation error messages.
 * @param form Formio form.
 * @param values The values to validate.
 * @param validators See `validate` for more information.
 * @return A promise which resolves (`void`) if all `values` are considered valid or
 * (`FormikErrors<IValues>`) if it is considered invalid.
 */
export const getFormErrors = async (
  form: IFormioForm,
  values: IValues,
  validators: Validator[] = DEFAULT_VALIDATORS
): Promise<FormikErrors<IValues> | void> => {
  try {
    await validateForm(form, values, validators);
    return;
  } catch (result) {
    return result;
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
 * (`{[index: string]: ValidationError[] | ValidationError[][]}`) it is considered invalid.
 */
export const validateForm = async (
  form: IFormioForm,
  values: IValues,
  validators = DEFAULT_VALIDATORS
): Promise<{[index: string]: ValidationError[] | ValidationError[][]} | void> => {
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
    const valueOrValues = _.get(values, key) as Value | Values;

    try {
      await validate(component, valueOrValues, values, validators);
    } catch (validationErrors) {
      _.set(errors, key, validationErrors);
    }
  });

  await Promise.all(promises);
  if (Object.keys(errors).length) {
    throw errors;
  }
};

/**
 * Validates a component.
 *
 * Runs each function in `validators` and passing it `component`, `valueOrValues`, `message`. and
 * `formValues`.
 * If all validators resolve a components is considered valid and the returned `Promise` resolves.
 * If not: the returned `Promise` rejects with a (possibly nested) array of `ValidationError` (subclasses).
 *
 * @param component Formio component schema passed to each validator.
 * @param valueOrValues The value(s) to validate.
 * @param formValues All the form values.
 *
 * @param validators An array of `async function`/`string` tuples. The function being the validator
 * function, the string a message used to indicate an invalid value. Each validator is run in order.
 *
 *  The validator function is called with `component`, the `valueOrValues`, the 'message' and all the
 *  `formValues`.
 *  The (async/sync) function should return a `Promise` which either resolves (valid) or rejects
 *  (invalid) with a (subclass of) `ValidationError` instantiated with `message`.
 *
 * @throws {ValidationError[] | ValidationError[][]} As promise rejection if invalid.
 *
 * @return A promise which resolves (`void`) if `value` is considered valid and rejects
 * (`ValidationError[] | ValidationError[][]`) it is considered invalid.
 */
export const validate = async (
  component: ExtendedComponentSchema,
  valueOrValues: Value | Values,
  formValues: IValues,
  validators = DEFAULT_VALIDATORS
): Promise<void> => {
  // Array of values (multiple), simple implementation for now.
  if (Array.isArray(valueOrValues)) {
    return validateValues(component, valueOrValues, formValues, validators);
  }
  // Single value.
  return validateValue(component, valueOrValues, formValues, validators);
};

/**
 * Implements validate for a multiple values.
 * @see {validate}
 */
export const validateValues = async (
  component: ExtendedComponentSchema,
  values: Values,
  formValues: IValues,
  validators: Validator[]
): Promise<void> => {
  // Array of values (multiple) simple implementation for now.
  const results = Array(values.length);
  const promises = values.map((value, index) => {
    return validateValue(component, value, formValues, validators).catch(errorsForInstance => {
      return (results[index] = errorsForInstance);
    });
  });

  await Promise.all(promises);
  if (results.some(v => v)) {
    throw results;
  }
};

/**
 * Implements validate for a singular value.
 * @see {validate}
 */
export const validateValue = async (
  component: ExtendedComponentSchema,
  value: Value,
  formValues: IValues,
  validators: Validator[]
): Promise<void> => {
  // Map all validators into an array of `Promise`s, implementing a catch handler building the
  // `errors` array.
  const validationErrors: ValidationError[] = [];
  const promises = validators.map(async ([validatorFunction, message]) => {
    try {
      await validatorFunction(component, value, message, formValues);
    } catch (e) {
      validationErrors.push({name: e.name, message: e.message});
    }
  });

  // Wait until all promises are completed. When so: check if the `errors` array contains items,
  // indicating that at least one validation error exists in the array.
  await Promise.all(promises);
  if (validationErrors.length) {
    throw validationErrors;
  }
};
