import {AnyComponentSchema} from '@open-formulieren/types';
import {getIn, setIn} from 'formik';

import {getClearOnHide, isHidden} from '@/formio';
import type {VisibilityContext} from '@/registry/types';
import type {JSONObject} from '@/types';

/**
 * The return value of `processVisibility`.
 */
interface ProcessVisibilityResult {
  /**
   * The subset of provided components that are visible with the currently provided
   * `values`.
   *
   * There are no guarantees about object identity - not for the array itself nor the
   * components inside.
   */
  visibleComponents: AnyComponentSchema[];
  /**
   * Updated `values` because of `clearOnHide` side-effects, or side-effects because
   * the component became visible (again). Unmodified values are guaranteed to have a
   * stable identity, for both the top-level and nested objects.
   */
  updatedValues: JSONObject;
}

/**
 * Given an array of components (like a form definition) and (current) component values,
 * evaluate the visibility of each component and its children. The return value is an
 * array of visible components and values updated by visibility/hidden side-effects.
 *
 * Only the visible components are returned so that the rendering logic can be kept
 * simple. The `updatedValues` are the result of applying side effects like
 * `clearOnHide` on each component (including nested components!).
 *
 * Layout components must implement the `applyVisibility` callback to ensure all child
 * components can apply their side-effects. You can call `processVisibility` inside
 * `applyVisibility` to recursively process the entire component tree.
 */
export const processVisibility = (
  /**
   * Form definition/subtree of components to test for visibility.
   */
  components: AnyComponentSchema[],
  /**
   * Submission (or item) values for the current scope. The root scope is equal to the
   * values for the _whole_ submission, but that's not always the case. Edit grids
   * essentially have a nested, isolated scope for each item with a nested subform tree
   * of components, with access to the outer sope. See the context parameter
   * `getEvaluationScope` for such situations.
   *
   * A component becoming visible or hidden produces side effects, which are applied to
   * the provided `values` - make sure the shape of `values` matches the component
   * definitions provided in `components`.
   */
  values: JSONObject,
  /**
   * Form definition/subtree context, used to pass callbacks to avoid circular
   * dependencies but also more fine-grained context set by one or more parent
   * components.
   */
  context: VisibilityContext
): ProcessVisibilityResult => {
  const visibleComponents: AnyComponentSchema[] = [];
  const {parentHidden, initialValues, getRegistryEntry, componentsMap} = context;

  // `updatedValues` may potentially be updated/mutated after each component is
  // processed. If there are no side-effects applied, then it will keep the same
  // identity because we use Formik's `setIn` under the hood.
  let updatedValues = values;

  // Process the component tree depth-first. We loop over the components in order of
  // definition, which matches top-to-bottom UI-wise. Within each component, we first
  // try to process its children (through `applyVisibility`) before moving on to the
  // next node -> this makes it depth first.
  for (let componentDefinition of components) {
    const {key} = componentDefinition;
    // check if the component is hidden, either because the parent is hidden or the
    // component itself is.
    const evaluationScope = context.getEvaluationScope?.(updatedValues) ?? updatedValues;
    const hidden =
      parentHidden ||
      isHidden(componentDefinition, evaluationScope, getRegistryEntry, componentsMap);
    const clearOnHide = getClearOnHide(componentDefinition);

    // apply the hidden/visibility state. `updatedValues` is updated directly inside the
    // loop so that the next iteration uses the side-effects as soon as possible.
    if (hidden) {
      // only clear the value if actually requested
      if (clearOnHide) updatedValues = clearValue(updatedValues, key);
    } else {
      // the component is visible - it may have been hidden and cleared before, so make
      // sure that we have a value for it. `initialValues` contains either the
      // user-submitted submission data, or is populated with the default/empty value
      // of the component/component type, see `FormioForm.tsx`.
      const hasValue = getIn(updatedValues, key) !== undefined;
      if (!hasValue) {
        updatedValues = setIn(updatedValues, key, getIn(initialValues, key));
      }
    }

    // now the component itself was processed, recurse into its children, if configured
    // to do so.
    const applyVisibility = getRegistryEntry(componentDefinition)?.applyVisibility;
    if (applyVisibility) {
      // applyVisibility should only affect child components/values, not the parent
      // scope, though it technically can
      const result = applyVisibility(componentDefinition, updatedValues, {
        ...context,
        parentHidden: hidden,
      });
      componentDefinition = result.updatedDefinition;
      updatedValues = result.updatedValues;
    }

    // finally, add the component if it's visible - this must be the last step so that
    // `applyVisibility` has a chance to dynamically update the component definition in
    // case some children are conditionally visible.
    if (!hidden) visibleComponents.push(componentDefinition);
  }

  return {visibleComponents, updatedValues};
};

/**
 * Clear the value of the specified `key`.
 *
 * This uses Formik's setIn because it keeps the `values` references stable if no
 * changes are being made.
 * Note that the reference behaviour in formio.js SDK is to remove the key
 * entirely from the submission data, not set the matching (component type
 * specific) 'empty' value. We achieve this by 'setting' the value to undefined.
 */
const clearValue = (values: JSONObject, key: string): JSONObject => {
  return setIn(values, key, undefined);
};
