import {AnyComponentSchema} from '@open-formulieren/types';

import type {GetRegistryEntry} from '@/registry/types';
import type {JSONValue} from '@/types';

/**
 * Extract the default/initial values from a component definition, recursively.
 *
 * The recursion is handled by deferring to the relevant components that know their
 * own structure and can transform the keys/values if needed.
 *
 * The registry resolver is passed as an argument/dependency injection, as we otherwise
 * run into circular import issues.
 *
 * @return Array of [name, value] tuples. The name is name of the form field, using a
 * dotted path syntax. The value may be any JSON value (primitive, array or object).
 */
export const extractInitialValues = (
  components: AnyComponentSchema[],
  getRegistryEntry: GetRegistryEntry
): Record<string, JSONValue> => {
  const initialValues = components.reduce(
    (acc: Record<string, JSONValue>, componentDefinition) => {
      const getInitialValues = getRegistryEntry(componentDefinition)?.getInitialValues;
      if (getInitialValues !== undefined) {
        const extraInitialValues = getInitialValues(componentDefinition, getRegistryEntry);
        acc = {...acc, ...extraInitialValues};
      }
      return acc;
    },
    {} satisfies Record<string, JSONValue>
  );
  return initialValues;
};
