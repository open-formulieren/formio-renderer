import type {AnyComponentSchema} from '@open-formulieren/types';

import BSN from './bsn';
import DateField from './date';
import EditGrid from './editgrid';
import Email from './email';
import Fieldset from './fieldset';
import PhoneNumber from './phoneNumber';
import RadioField from './radio';
import TextField from './textfield';
import type {GetRegistryEntry, Registry, RegistryEntry} from './types';

export const getRegistryEntry: GetRegistryEntry = (
  componentDefinition: AnyComponentSchema
): RegistryEntry<AnyComponentSchema> | undefined => {
  const entry = REGISTRY[componentDefinition.type];
  return entry;
};

const REGISTRY: Registry = {
  // basic
  textfield: TextField,
  email: Email,
  date: DateField,
  phoneNumber: PhoneNumber,
  radio: RadioField,
  // special types
  bsn: BSN,
  editgrid: EditGrid,
  // layout
  fieldset: Fieldset,
  // deprecated
};
