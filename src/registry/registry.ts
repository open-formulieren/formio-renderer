import type {AnyComponentSchema} from '@open-formulieren/types';

import BSN from './bsn';
import Checkbox from './checkbox';
import Columns from './columns';
import Content from './content';
import DateField from './date';
import EditGrid from './editgrid';
import Email from './email';
import Fieldset from './fieldset';
import IBAN from './iban';
import LicensePlate from './licenseplate';
import PhoneNumber from './phoneNumber';
import RadioField from './radio';
import Selectboxes from './selectboxes';
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
  checkbox: Checkbox,
  selectboxes: Selectboxes,
  radio: RadioField,
  // special types
  iban: IBAN,
  licenseplate: LicensePlate,
  bsn: BSN,
  editgrid: EditGrid,
  // layout
  content: Content,
  columns: Columns,
  fieldset: Fieldset,
  // deprecated
};
