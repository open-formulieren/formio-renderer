import AddressNL from './addressNL';
import BSN from './bsn';
import Checkbox from './checkbox';
import Children from './children';
import Columns from './columns';
import Content from './content';
import Cosign from './cosign';
import CosignOld from './cosignOld';
import Currency from './currency';
import CustomerProfile from './customerProfile';
import DateField from './date';
import DateTimeField from './datetime';
import EditGrid from './editgrid';
import Email from './email';
import Fieldset from './fieldset';
import File from './file';
import IBAN from './iban';
import LicensePlate from './licenseplate';
import MapComponent from './map';
import Number from './number';
import Partners from './partners';
import PhoneNumber from './phoneNumber';
import PostCode from './postcode';
import RadioField from './radio';
import Select from './select';
import Selectboxes from './selectboxes';
import Signature from './signature';
import SoftRequiredErrors from './softRequiredErrors';
import Textarea from './textarea';
import TextField from './textfield';
import Time from './time';
import type {GetRegistryEntry, Registry, RegistryEntry, SupportedComponentSchema} from './types';

export const getRegistryEntry: GetRegistryEntry = (
  componentDefinition: SupportedComponentSchema
): RegistryEntry<SupportedComponentSchema> | undefined => {
  const entry = REGISTRY[componentDefinition.type];
  return entry;
};

const REGISTRY: Registry = {
  // basic
  textfield: TextField,
  email: Email,
  date: DateField,
  datetime: DateTimeField,
  time: Time,
  phoneNumber: PhoneNumber,
  file: File,
  textarea: Textarea,
  number: Number,
  map: MapComponent,
  checkbox: Checkbox,
  selectboxes: Selectboxes,
  select: Select,
  currency: Currency,
  radio: RadioField,
  // special types
  iban: IBAN,
  licenseplate: LicensePlate,
  postcode: PostCode,
  bsn: BSN,
  signature: Signature,
  cosign: Cosign,
  editgrid: EditGrid,
  addressNL: AddressNL,
  partners: Partners,
  children: Children,
  customerProfile: CustomerProfile,
  // layout
  content: Content,
  columns: Columns,
  fieldset: Fieldset,
  softRequiredErrors: SoftRequiredErrors,
  // deprecated
  coSign: CosignOld,
};
