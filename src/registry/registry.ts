import type {AnyComponentSchema} from '@open-formulieren/types';

import BSN from './bsn';
import Checkbox from './checkbox';
import Columns from './columns';
import Content from './content';
import Cosign from './cosign';
import Currency from './currency';
import DateField from './date';
import EditGrid from './editgrid';
import Email from './email';
import Fieldset from './fieldset';
import IBAN from './iban';
import LicensePlate from './licenseplate';
import Number from './number';
import PostalCodeField from './postalcode';
import PhoneNumber from './phoneNumber';
import RadioField from './radio';
import Select from './select';
import Selectboxes from './selectboxes';
import SoftRequiredErrors from './softRequiredErrors';
import Textarea from './textarea';
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
  textarea: Textarea,
  number: Number,
  checkbox: Checkbox,
  selectboxes: Selectboxes,
  select: Select,
  currency: Currency,
  radio: RadioField,
  // special types
  iban: IBAN,
  licenseplate: LicensePlate,
  postalcode: PostalCodeField,
  bsn: BSN,
  cosign: Cosign,
  editgrid: EditGrid,
  // layout
  content: Content,
  columns: Columns,
  fieldset: Fieldset,
  softRequiredErrors: SoftRequiredErrors,
  // deprecated
};
