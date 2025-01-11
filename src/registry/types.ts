import type {AnyComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {FormioComponentProps} from '@/components/FormioComponent';
import type {JSONValue} from '@/types';

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
  renderNested?: React.FC<FormioComponentProps>;
}

export type GetInitialValues<S, V = JSONValue> = (
  componentDefinition: S,
  // dependency injection to avoid circular imports
  getRegistryEntry: GetRegistryEntry
) => Record<string, V>;

export type GetValidationSchema<S> = (
  componentDefinition: S,
  // dependency injection to avoid circular imports
  getRegistryEntry: GetRegistryEntry
) => Record<string, z.ZodFirstPartySchemaTypes>;

export type RegistryEntry<S> = [S] extends [AnyComponentSchema] // prevent distributing unions in a single schema
  ? {
      formField: React.FC<RenderComponentProps<S>>;
      /**
       * Derive the default/initial values from the compnent, optionally recursing.
       *
       * The callback must return an object with component key strings as keys and the
       * initial value as value for that key. Multiple keys may be returned, since a
       * layout component may contain nested input components each with their own
       * default values.
       */
      getInitialValues?: GetInitialValues<S>;
      /**
       * Build the validation schema from the component definition.
       */
      getValidationSchema?: GetValidationSchema<S>;
    }
  : never;

export type Registry = {
  // TODO: drop the '?' once all component types are implemented
  [S in AnyComponentSchema as S['type']]?: RegistryEntry<S>;
};
