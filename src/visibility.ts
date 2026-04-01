import type {AnyComponentSchema, JSONValue} from '@open-formulieren/types';
import {getIn, setIn} from 'formik';
import {isEqual} from 'lodash';

import type {NestedObject} from '@/components/utils';
import {getClearOnHide, isHidden} from '@/formio';
import type {VisibilityContext} from '@/registry/types';
import type {JSONObject} from '@/types';

/**
 * The possible errors in the Formik state.
 *
 * @note We don't use the `FormikErrors` type here because it's too limited with a
 * generic JSONObject `Values` type argument - it simplifies to `{[k: string]: string}`,
 * but the actual error structure mimicks the values structure that can string keys
 * and values of type:
 *
 * - string
 * - string[] (for components with multiple: true, for example)
 * - nested error structure (object), for `foo.bar` like component keys
 * - arrays of nested error structures or strings, like for edit grids, where the
 *   error may be about the item as a whole (string) or an object (item field errors)
 *
 * The errors structure itself may also be `undefined`, when there's *no* error for a
 * particular field at all.
 */
export type Errors = NestedObject<string | string[] | Errors[]> | string | string[] | undefined;

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
  /**
   * Updated `errors` because of visibility logic. A component can be invalid when it is
   * not hidden. The key of a hidden component should not be in the object even if it
   * "used" to be invalid.
   */
  updatedErrors: Errors;
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
   * Validation errors for the current scope. The root scope is equal to the
   * errors for the _whole_ submission, but that's not always the case. Edit grids
   * essentially have a nested, isolated scope for each item with a nested subform tree
   * of components, with access to the outer sope. See the context parameter
   * `getEvaluationScope` for such situations.
   *
   * A component becoming hidden produces side effects - the validation errors for that
   * component must be cleared to not block submission. Make sure the shape of `errors`
   * matches the component definitions provided in `components`.
   */
  errors: Errors,
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
  let updatedErrors = errors;

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
      if (clearOnHide) {
        const clearValueCallback = context?.clearValueCallback ?? clearValue;
        updatedValues = clearValueCallback(updatedValues, key);
      }
      // update the errors if any component is invalid but hidden
      updatedErrors = clearErrors(updatedErrors, key);
    } else {
      // the component is visible - it may have been hidden and cleared before, so make
      // sure that we have a value for it. `initialValues` contains either the
      // user-submitted submission data, or is populated with the default/empty value
      // of the component/component type, see `FormioForm.tsx`.
      const currentValue: JSONValue | undefined = getIn(updatedValues, key);
      const hasValue = currentValue !== undefined;
      const newValue: JSONValue | undefined = getIn(initialValues, key);

      const shouldSyncFromInitialValues = !!(
        !hasValue ||
        (context.emulateBackend && !isEqual(currentValue, newValue))
      );

      if (newValue !== undefined && shouldSyncFromInitialValues) {
        updatedValues = setIn(updatedValues, key, newValue);
      }

      // we don't 'restore' errors like we do values - when a component becomes visible,
      // assume a pristine state. The client and server-side validation will set them
      // again whenever it's necessary.
    }

    // now the component itself was processed, recurse into its children, if configured
    // to do so.
    const applyVisibility = getRegistryEntry(componentDefinition)?.applyVisibility;
    if (applyVisibility) {
      // applyVisibility should only affect child components/values, not the parent
      // scope, though it technically can
      const result = applyVisibility(componentDefinition, updatedValues, updatedErrors, {
        ...context,
        parentHidden: hidden,
      });
      componentDefinition = result.updatedDefinition;
      updatedValues = result.updatedValues;
      updatedErrors = result.updatedErrors;
    }

    // finally, add the component if it's visible - this must be the last step so that
    // `applyVisibility` has a chance to dynamically update the component definition in
    // case some children are conditionally visible.
    if (!hidden) visibleComponents.push(componentDefinition);
  }

  return {visibleComponents, updatedValues, updatedErrors};
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

/**
 * Clear any validation error(s) for the specified `key`.
 *
 * The key points to a component that can be of any type, as such, the errors could be
 * a single string, nested object or even an array for edit grids, depending on how deep
 * in the tree the key points.
 *
 * We use Formik's `setIn` because it keeps the `errors` refernce stable if no changes
 * are being made, which is crucial for equality/identity checks in the React hooks.
 */
const clearErrors = (errors: Errors, key: string): Errors => {
  if (errors === undefined) return errors;
  let updated: Errors = setIn(errors, key, undefined);

  // we must crawl up and check if we have empty-ish error objects so that Formik's
  // isValid correctly reports whether there are errors or not
  const bits = key.split('.');
  for (let i = bits.length; i > 0; i--) {
    const parentKey = bits.slice(0, i).join('.');
    const parentErrors: Errors = getIn(updated, parentKey);
    if (
      !parentErrors ||
      (Array.isArray(parentErrors) && !parentErrors.length) ||
      (typeof parentErrors == 'object' && !Object.keys(parentErrors).length)
    ) {
      updated = setIn(updated, parentKey, undefined);
    }
  }
  return updated;
};
