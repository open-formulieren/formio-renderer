import {IRendererComponent} from '@lib/renderer';
import {ValidationError} from '@lib/validation/validationerror';
import {
  validateMaxLength,
  validateMinLength,
  validatePattern,
  validateRequired,
} from '@lib/validation/validators';
import {IFormioForm, IValues, value} from '@types';
import {ComponentSchema} from 'formiojs';

export type validator = [
  (componentSchema: ComponentSchema, value: value, message: string) => Promise<void>,
  string
];

export const DEFAULT_VALIDATORS: validator[] = [
  [validateMaxLength, 'Er zijn teveel karakters opgegeven.'],
  [validateMinLength, 'Er zijn te weinig karakters opgegeven.'],
  [validatePattern, 'De opgegeven waarde voldoet niet aan het formaat.'],
  [validateRequired, 'Het verplichte veld is niet ingevuld'],
];

/**
 * Validates a form.
 *
 * Finds each component in `form` and validates matching `values` using `validators`.
 * If all validators resolve a form is considered valid and the returned `Promise` resolves.
 * If not: the returned `Promise` rejects with an object mapping component keys to (an array of)
 * `ValidationError`s.
 *
 * @param form Formio form.
 * @param values The values to validate.
 * @param validators See `validate` for more information. *
 * @throws {ValidationError[]} As promise rejection if invalid.
 * @return A promise which resolves (`void`) if a component is considered valid and rejects
 * (`{[index: string]: ValidationError[]}`) it is considered invalid.
 */
export const validateForm = async (
  form: IFormioForm,
  values: IValues,
  validators = DEFAULT_VALIDATORS
): Promise<{[index: string]: ValidationError[]}> => {
  const errors = {};
  const promises = Object.entries(values).map(async ([key, value]) => {
    const component = getComponentByKey(key, form);

    try {
      await validate(component, value as value, validators);
    } catch (e) {
      errors[key] = e;
    }
  });

  await Promise.all(promises);
  return errors;
};

/**
 * Validates a component.
 *
 * Runs each function in `validators` and passing it `componentSchema` and `message`.
 * If all validators resolve a components is considered valid and the returned `Promise` resolves.
 * If not: the returned `Promise` rejects with an array of `ValidationError` (subclasses).
 *
 * @param componentSchema Formio component passed to each validator.
 * @param value The value to validate.
 *
 * @param validators An array of `async function`/`string` tuples. The function being the validator
 * function, the string a message used to indicate an invalid value. Each validator is run in order.
 *
 *  The validator function is called with `componentProps` (containing the value) and the error
 *  `message`. The (async) function should return a `Promise` which either resolves (valid) or
 *  rejects (invalid) with a (subclass of) `ValidationError` instantiated with `message`.
 *
 * @throws {ValidationError[]} As promise rejection if invalid.
 *
 * @return A promise which resolves (`void`) if a component is considered valid and rejects
 * (`ValidationError[]`) it is considered invalid.
 */
export const validate = async (
  componentSchema: ComponentSchema,
  value: value,
  validators = DEFAULT_VALIDATORS
): Promise<void> => {
  // Map all validators into an array of `Promise`s, implementing a catch handler building the
  // `errors` array.
  const errors: ValidationError[] = [];
  const promises = validators.map(([validatorFunction, message]) =>
    validatorFunction(componentSchema, value, message).catch((e: ValidationError) => errors.push(e))
  );

  // Wait until all promises are completed. When so: check if the `errors` array contains items,
  // indicating that at least one validation error exists in the array.
  await Promise.all(promises);
  if (errors.length) {
    return Promise.reject(errors);
  }
  return Promise.resolve();
};

/**
 * Finds component with `key` in `form` recursively, return null if the component cannot  be found.
 */
export function getComponentByKey(key: string, form: IFormioForm): ComponentSchema {
  const component = form.components
    .reduce((acc, val: IRendererComponent) => {
      const components = val.components || [];
      const columns = val.columns || [];
      const columnComponents = columns.reduce(
        (acc, val) => [...acc, ...val.components],
        form.components
      );
      return [...acc, ...components, ...columnComponents];
    }, [])
    .find(c => c.key === key);

  if (!component) {
    throw new Error(`Cant find component with key ${key}`);
  }
  return component;
}
