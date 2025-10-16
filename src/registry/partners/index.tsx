import type {PartnersComponentSchema} from '@open-formulieren/types';

import type {FormioComponentProps} from '@/components/FormioComponent';
import Partners from '@/components/forms/Partners';
import type {GetRegistryEntry, RegistryEntry} from '@/registry/types';

export interface FormioPartnersFieldProps {
  componentDefinition: PartnersComponentSchema;
  renderNested: React.FC<FormioComponentProps>;
  getRegistryEntry: GetRegistryEntry;
}

export const FormioPartnersField: React.FC<FormioPartnersFieldProps> = ({
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

const PartnersFieldComponent: RegistryEntry<PartnersComponentSchema> = {
  formField: FormioPartnersField,
};

export default PartnersFieldComponent;
