import {AnyComponentSchema} from '@open-formulieren/types';
import {getIn, setIn} from 'formik';

import {isHidden} from '@/formio';
import type {GetRegistryEntry} from '@/registry/types';
import type {JSONObject} from '@/types';
import {extractInitialValues} from '@/values';

interface VisibleComponentsResult {
  visibleComponents: AnyComponentSchema[];
  values: JSONObject;
}

/**
 * Clear the value of the specified `key`.
 *
 * This uses Formik's setIn because it keeps the `values` references stable if no
 * changes are being made.
 * Note that the reference behaviour in formio.js SDK is to remove the key
 * entirely from the submission data, not set the matching (component type
 * specific) 'empty' value. We achieve this by 'setting' the value to undefined.
 */
export const clearValue = (values: JSONObject, key: string): JSONObject => {
  return setIn(values, key, undefined);
};

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
  initialValues: JSONObject,
  getRegistryEntry: GetRegistryEntry,
  parentHidden: boolean = false,
  extraEvaluationScope?: JSONObject
): VisibleComponentsResult => {
  const visibleComponents = components.reduce((acc: AnyComponentSchema[], componentDefinition) => {
    const {key} = componentDefinition;
    const hidden = parentHidden || isHidden(componentDefinition, values, extraEvaluationScope);
    const clearOnHide = getClearOnHide(componentDefinition);

    if (hidden && clearOnHide) {
      // Update/mutate values inside this loop, so that the updated values are used
      // immediately for the next component. If nothing changes (there was no value set),
      // then the values identity remains the same (compare by reference works!) because of
      // the `setIn` usage.
      values = clearValue(values, key);
    } else if (!hidden) {
      const hasValue = getIn(values, key) !== undefined;
      // if the component is visible but no value is present in the formik state (e.g. because
      // of an earlier clearOnHide action), grab it from the initial submission data if present,
      // otherwise use the default value
      if (!hasValue) {
        let valueToSet = getIn(initialValues, key);
        const _initialValues = extractInitialValues([componentDefinition], getRegistryEntry);
        // fall back to the component default
        if (valueToSet === undefined) {
          valueToSet = getIn(_initialValues, key);
        }
        values = setIn(values, key, valueToSet);
      }
    }

    // Always process the component children if a hook is configured - the `clearOnHide`
    // may be enabled on children and needs to be applied when the parent is hidden,
    // as that implies the child is hidden.
    const excludeHiddenComponents = getRegistryEntry(componentDefinition)?.excludeHiddenComponents;
    if (excludeHiddenComponents) {
      const {componentDefinition: newComponentDefinition, values: updatedValues} =
        excludeHiddenComponents(
          componentDefinition,
          values,
          initialValues,
          hidden,
          getRegistryEntry
        );
      componentDefinition = newComponentDefinition;
      values = updatedValues;
    }

    // Only add the component to the accumulator if it's visible. This must be the last
    // step after all processing of its children has been done.
    if (!hidden) {
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
