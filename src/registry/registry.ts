import type {AnyComponentSchema} from '@open-formulieren/types';

import Email, {
  getInitialValues as emailGetInitialValues,
  getValidationSchema as emailGetValidationSchema,
} from './email';
import Fieldset, {
  getInitialValues as fieldsetGetInitialValues,
  getValidationSchema as fieldsetGetValidationSchema,
} from './fieldset';
import RadioField, {
  getInitialValues as radioGetInitialValues,
  getValidationSchema as radioGetValidationSchema,
} from './radio';
import TextField, {
  getInitialValues as textFieldGetInitialValues,
  getValidationSchema as textFieldGetValidationSchema,
} from './textfield';
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
    getValidationSchema: textFieldGetValidationSchema,
  },
  email: {
    formField: Email,
    getInitialValues: emailGetInitialValues,
    getValidationSchema: emailGetValidationSchema,
  },
  radio: {
    formField: RadioField,
    getInitialValues: radioGetInitialValues,
    getValidationSchema: radioGetValidationSchema,
  },
  // special types
  // layout
  fieldset: {
    formField: Fieldset,
    getInitialValues: fieldsetGetInitialValues,
    getValidationSchema: fieldsetGetValidationSchema,
  },
  // deprecated
};
