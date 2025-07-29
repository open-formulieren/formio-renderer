import type {AnyComponentSchema, OFConditionalOptions} from '@open-formulieren/types';
import {IntlShape} from 'react-intl';
import {z} from 'zod';

import type {FormioComponentProps} from '@/components/FormioComponent';
import type {JSONObject, JSONValue} from '@/types';

export type GetRegistryEntry = (
  componentDefinition: AnyComponentSchema
) => RegistryEntry<AnyComponentSchema> | undefined;

/**
 * The props that every field render component must support.
 *
 * The interface/props are generic in the component schema - make sure to narrow this
 * for the component-type specific props/component.
 */
export interface RenderComponentProps<S extends AnyComponentSchema = AnyComponentSchema> {
  /**
   * The Formio.js component definition, limited to the features supported in Open Forms.
   */
  componentDefinition: S;
  /**
   * The generic render component for nested components, if applicable.
   */
  renderNested: React.FC<FormioComponentProps>;
  /**
   * The registry entrypoint to look up the component-type specific configuration for
   * a given component.
   *
   * This must be passed dynamically as a prop to avoid circular imports, as the registry
   * depends on low-level React components/primitives, while the high-level components
   * use the registry API, which creates an inherent circular dependency when dealing
   * with tree visitors.
   */
  getRegistryEntry: GetRegistryEntry;
}

export type GetInitialValues<S, V = JSONValue> = (
  componentDefinition: S,
  // dependency injection to avoid circular imports
  getRegistryEntry: GetRegistryEntry
) => Record<string, V>;

export interface ValueDisplayProps<S, V extends JSONValue | unknown = unknown> {
  componentDefinition: S;
  value: V;
}

export type GetValidationSchema<S> = (
  componentDefinition: S,
  // intl object to localize error messages
  intl: IntlShape,
  // dependency injection to avoid circular imports
  getRegistryEntry: GetRegistryEntry
) => Record<string, z.ZodFirstPartySchemaTypes>;

export interface VisibilityContext {
  /**
   * Indicator whether the parent of the provided `componentDefinition` is visible or
   * not, if there is a parent. Child components are implicitly hidden as soon as any
   * parent is hidden.
   */
  parentHidden: boolean;
  /**
   * Initial component values from when the form/submission was initialized. When a
   * component becomes visible again after having been hidden, its value is taken from
   * the initial values or otherwise the defualt/empty value of the component is used.
   *
   * It is a stable identity and initialized only once.
   */
  initialValues: JSONObject;
  /**
   * Hook to look up a component in the registry, passed as context to avoid circular
   * imports/dependencies. It is a stable identity and initialized only once.
   */
  getRegistryEntry: GetRegistryEntry;
  /**
   * Callback allowing the call site to provide the evaluation scope for the
   * visibility check. If unspecified, the `values` from the previous loop iteration
   * are used.
   */
  getEvaluationScope?: (currentValues: JSONObject) => JSONObject;
  /**
   * A mapping of component key -> component definition so that a value can be
   * interpreted in the right context.
   */
  componentsMap: Partial<Record<string, AnyComponentSchema>>;
}

export type TestConditional<
  S,
  V extends Required<OFConditionalOptions>['eq'] = Required<OFConditionalOptions>['eq'],
> = (
  /**
   * The component definition referenced by `conditional.when`.
   */
  referenceComponent: S,
  /**
   * The reference value specified in `conditional.eq`.
   */
  compareValue: V,
  /**
   * The current value of the referenced component to compare against.
   */
  valueToTest: JSONValue
) => boolean;

/**
 * Callback to process the visibility state of a component, required for container/layout
 * component types that must propagate the side-effects/visibility into their child
 * components.
 *
 * This callback is invoked recursively for the whole component tree.
 */
export type ApplyVisibility<S> = (
  /**
   * The component definition being processed. Use it as a base to produce the
   * `updatedDefinition` in the return value.
   */
  componentDefinition: S,
  /**
   * The current form field/component values, used to evaluate conditional visibility
   * logic.
   *
   * @note every (nested) component being processed may mutate the values and the
   * mutations are immediately used in the next loop/component iteration. The final
   * result after all mutations are applied is returend as `updatedValues`.
   */
  values: JSONObject,
  /**
   * Additional context/utilities relevant to evaluate a component (sub) tree.
   */
  context: VisibilityContext
) => {
  /**
   * The updated component definition, with hidden components removed.
   *
   * The exact shape depends on the component type being processed. If the component
   * or its child components are all visible, the `updatedDefinition` may be the same
   * as in the input definition, but there are no guarantees about object identities.
   */
  updatedDefinition: S;
  /**
   * Updated form values after applying `clearOnHide` behaviour. If nothing changes,
   * the object keeps the same identity, and this applies for nested properties. Values
   * may be cleared (removed) for (nested) components that are hidden, but values may
   * also be (re-)added because of a component *becoming* visible.
   *
   * `updatedValues` is intended to be fed back into the Formik `values` state so that
   * the component definitions and values resolve/converge.
   *
   * @note for resolution to be guaranteed, there must not be any cycles between
   * component definitions that would create infinite loops.
   */
  updatedValues: JSONObject;
};

export type RegistryEntry<S> = [S] extends [AnyComponentSchema] // prevent distributing unions in a single schema
  ? {
      formField: React.ComponentType<RenderComponentProps<S>>;
      /**
       * Derive the default/initial values from the component, optionally recursing.
       *
       * The callback must return an object with component key strings as keys and the
       * initial value as value for that key. Multiple keys may be returned, since a
       * layout component may contain nested input components each with their own
       * default values.
       */
      getInitialValues?: GetInitialValues<S>;
      /**
       * Derive the summary/read-only of a field for the given component definition.
       *
       * The raw form field value is displayed in a useful way for summaries, taking the
       * intrinsic data type of the component into account.
       */
      valueDisplay?: React.ComponentType<ValueDisplayProps<S>>;
      /**
       * Build the validation schema from the component definition.
       */
      getValidationSchema?: GetValidationSchema<S>;
      /**
       * Callback to test a submission value for equality in the context of the
       * specific component type.
       */
      testConditional?: TestConditional<S>;
      /**
       * Apply visibility state and/or side-effects.
       */
      applyVisibility?: ApplyVisibility<S>;
    }
  : never;

export type Registry = {
  // TODO: drop the '?' once all component types are implemented
  [S in AnyComponentSchema as S['type']]?: RegistryEntry<S>;
};
