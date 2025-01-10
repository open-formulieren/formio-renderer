import type {AnyComponentSchema} from '@open-formulieren/types';

import Email, {getInitialValues as emailGetInitialValues} from './email';
import Fieldset, {getInitialValues as fieldsetGetInitialValues} from './fieldset';
import TextField, {getInitialValues as textFieldGetInitialValues} from './textfield';
import type {GetRegistryEntry, Registry, RegistryEntry} from './types';

export const getRegistryEntry: GetRegistryEntry = (
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
  email: {
    formField: Email,
    getInitialValues: emailGetInitialValues,
  },
  // special types
  // layout
  fieldset: {
    formField: Fieldset,
    getInitialValues: fieldsetGetInitialValues,
  },
  // deprecated
};
