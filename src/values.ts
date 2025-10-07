import type {AnyComponentSchema} from '@open-formulieren/types';
import {setIn} from 'formik';

import type {GetRegistryEntry} from '@/registry/types';
import type {JSONObject} from '@/types';

/**
 * Extract the default/initial values from a component definition, recursively.
 *
 * The recursion is handled by deferring to the relevant components that know their
 * own structure and can transform the keys/values if needed.
 *
 * The registry resolver is passed as an argument/dependency injection, as we otherwise
 * run into circular import issues.
 *
 * @return Mapping of {name: value} pairs. The name is name of the form field, using a
 * dotted path syntax. The value may be any JSON value (primitive, array or object).
 */
export const extractInitialValues = (
  components: AnyComponentSchema[],
  getRegistryEntry: GetRegistryEntry
): JSONObject => {
  const initialValues = components.reduce((acc: JSONObject, componentDefinition) => {
    const getInitialValues = getRegistryEntry(componentDefinition)?.getInitialValues;
    if (getInitialValues !== undefined) {
      const extraInitialValues = getInitialValues(componentDefinition, getRegistryEntry);
      acc = {...acc, ...extraInitialValues};
    }
    return acc;
  }, {} satisfies JSONObject);
  return initialValues;
};

/**
 * Unnest an object, joining intermediate keys with a `.` character.
 */
const unnest = (obj: JSONObject): JSONObject =>
  Object.entries(obj).reduce((acc: JSONObject, [key, value]) => {
    if (value === null) {
      acc[key] = value;
    } else if (Array.isArray(value)) {
      acc[key] = value;
    } else if (typeof value === 'object') {
      Object.entries(unnest(value)).forEach(([nestedKey, nestedValue]) => {
        acc[`${key}.${nestedKey}`] = nestedValue;
      });
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} satisfies JSONObject);

/**
 * Deep merge the provided arguments.
 *
 * The `base` is expected to be a flat mapping of dotted path keys (like `foo.bar`),
 * while `overrides` can be a nested object that will be normalized to dotted path keys
 * before deep merging. `base` is intended to be the result of `extractInitialvalues`.
 *
 * Right now, no guarantees about stable identities are provided yet, but those may
 * come in the future.
 */
export const deepMergeValues = (base: JSONObject, overrides: JSONObject): JSONObject => {
  let result = {} satisfies JSONObject;
  // first, unnest the overrides into a flat map.
  const unnestedOverrides = unnest(overrides);
  // then, merge the flat map and convert it into a deeply nested object
  const merged = {...base, ...unnestedOverrides};
  Object.entries(merged).forEach(([key, value]) => {
    result = setIn(result, key, value);
  });
  return result;
};
