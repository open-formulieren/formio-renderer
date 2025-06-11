import {AnyComponentSchema} from '@open-formulieren/types';
import {setIn} from 'formik';

import {isHidden} from '@/formio';
import type {GetRegistryEntry} from '@/registry/types';
import type {JSONObject} from '@/types';

interface VisibleComponentsResult {
  visibleComponents: AnyComponentSchema[];
  values: JSONObject;
}

/**
 * Filter the given components down to the ones that are visible given the current
 * form values.
 *
 * This returns a copy of the components tree provided with hidden components omitted,
 * taken into account layout components that may have nested hidden components.
 */
export const filterVisibleComponents = (
  components: AnyComponentSchema[],
  values: JSONObject,
  getRegistryEntry: GetRegistryEntry
): VisibleComponentsResult => {
  const visibleComponents = components.reduce((acc: AnyComponentSchema[], componentDefinition) => {
    const hidden = isHidden(componentDefinition, values);
    const clearOnHide = getClearOnHide(componentDefinition);

    if (hidden) {
      console.info(`Component ${componentDefinition.key} is not visible`);
      if (clearOnHide) {
        // use Formik's setIn because it keeps the `values` references stable if no
        // changes are being made.
        // Note that the reference behaviour in formio.js SDK is to remove the key
        // entirely from the submission data, not set the matching (component type
        // specific) 'empty' value.
        // Finally - we update/mutate values inside this loop, so that the updated
        // values are used immediately for the next component.
        values = setIn(values, componentDefinition.key, undefined);
      }

      // TODO: ensure that the clearOnHide behaviour is also applied to nested components
    } else {
      // if it's not hidden, there *may* be children that are hidden. We recurse if
      // there's a handler in the registry!
      const excludeHiddenComponents =
        getRegistryEntry(componentDefinition)?.excludeHiddenComponents;
      if (excludeHiddenComponents) {
        const {componentDefinition: newComponentDefinition, values: updatedValues} =
          excludeHiddenComponents(componentDefinition, values, getRegistryEntry);
        componentDefinition = newComponentDefinition;
        values = updatedValues;
      }
      acc.push(componentDefinition);
    }
    return acc;
  }, []);

  return {
    visibleComponents,
    values,
  };
};

export const getClearOnHide = (componentDefinition: AnyComponentSchema): boolean => {
  if ('clearOnHide' in componentDefinition) {
    return componentDefinition.clearOnHide ?? true;
  }
  return true;
};
