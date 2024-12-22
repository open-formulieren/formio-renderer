import type {AnyComponentSchema} from '@open-formulieren/types';

import {FormioComponentProps} from '@/components/FormioComponent';

import Fieldset from './fieldset';
import TextField from './textfield';

type RegistryEntry<S> = [S] extends [AnyComponentSchema] // prevent distributing unions in a single schema
  ? React.FC<FormioComponentProps<S>>
  : never;

export type Registry = {
  // TODO: drop the '?' once all component types are implemented
  [S in AnyComponentSchema as S['type']]?: RegistryEntry<S>;
};

export const getRegistryEntry = (
  componentDefinition: AnyComponentSchema
): RegistryEntry<AnyComponentSchema> | undefined => {
  const entry = REGISTRY[componentDefinition.type];
  return entry;
};

export const REGISTRY: Registry = {
  // basic
  textfield: TextField,
  // special types
  // layout
  fieldset: Fieldset,
  // deprecated
};
