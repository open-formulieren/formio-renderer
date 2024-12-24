import type {AnyComponentSchema} from '@open-formulieren/types';

import Fieldset from './fieldset';
import TextField, {getInitialValues as textFieldGetInitialValues} from './textfield';
import type {Registry, RegistryEntry} from './types';

export const getRegistryEntry = (
  componentDefinition: AnyComponentSchema
): RegistryEntry<AnyComponentSchema> | undefined => {
  const entry = REGISTRY[componentDefinition.type];
  return entry;
};

const REGISTRY: Registry = {
  // basic
  textfield: {
    formField: TextField,
    getInitialValues: textFieldGetInitialValues,
  },
  // special types
  // layout
  fieldset: {
    formField: Fieldset,
  },
  // deprecated
};
