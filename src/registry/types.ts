import type {AnyComponentSchema} from '@open-formulieren/types';

import type {FormioComponentProps} from '@/components/FormioComponent';

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

export type RegistryEntry<S> = [S] extends [AnyComponentSchema] // prevent distributing unions in a single schema
  ? {
      formField: React.FC<RenderComponentProps<S>>;
    }
  : never;

export type Registry = {
  // TODO: drop the '?' once all component types are implemented
  [S in AnyComponentSchema as S['type']]?: RegistryEntry<S>;
};
