import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';

import type {FormioComponentProps} from '@/components/FormioComponent';
import Partners from '@/components/forms/Partners';
import type {GetRegistryEntry, RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';

export interface PartnersFieldProps {
  componentDefinition: PartnersComponentSchema;
  renderNested: React.FC<FormioComponentProps>;
  getRegistryEntry: GetRegistryEntry;
}

export const PartnersField: React.FC<PartnersFieldProps> = ({
  componentDefinition: {key, label, description, tooltip},
  renderNested,
  getRegistryEntry,
}) => {
  return (
    <Partners
      name={key}
      label={label}
      description={description}
      tooltip={tooltip}
      renderNested={renderNested}
      getRegistryEntry={getRegistryEntry}
    />
  );
};

const PartnersComponent: RegistryEntry<PartnersComponentSchema, PartnerDetails[]> = {
  formField: PartnersField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  isEmpty,
};

export default PartnersComponent;
