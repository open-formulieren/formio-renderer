import type {AnyComponentSchema} from '@open-formulieren/types';
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

export type ExcludeHiddenComponents<S> = (
  componentDefinition: S,
  values: JSONObject,
  // dependency injection to avoid circular imports
  getRegistryEntry: GetRegistryEntry
) => S;

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
       * Filter out hidden (nested) components so they don't get displayed.
       */
      excludeHiddenComponents?: ExcludeHiddenComponents<S>;
    }
  : never;

export type Registry = {
  // TODO: drop the '?' once all component types are implemented
  [S in AnyComponentSchema as S['type']]?: RegistryEntry<S>;
};
