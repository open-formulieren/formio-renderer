import type {PartnersComponentSchema} from '@open-formulieren/types';

import Partners from '@/components/forms/Partners';
import type {RegistryEntry} from '@/registry/types';

export interface FormioPartnersFieldProps {
  componentDefinition: PartnersComponentSchema;
}

export const FormioPartnersField: React.FC<FormioPartnersFieldProps> = ({
  componentDefinition: {key, label, description, tooltip},
}) => {
  return <Partners name={key} label={label} description={description} tooltip={tooltip} />;
};

const PartnersFieldComponent: RegistryEntry<PartnersComponentSchema> = {
  formField: FormioPartnersField,
};

export default PartnersFieldComponent;
