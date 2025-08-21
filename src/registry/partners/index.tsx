import type {PartnersComponentSchema} from '@open-formulieren/types';

import type {FormioComponentProps} from '@/components/FormioComponent';
import Partners from '@/components/forms/Partners';
import type {GetRegistryEntry, RegistryEntry} from '@/registry/types';

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

const PartnersComponent: RegistryEntry<PartnersComponentSchema> = {
  formField: PartnersField,
  // valueDisplay: ValueDisplay,
  // getInitialValues,
  // getValidationSchema,
};

export default PartnersComponent;
