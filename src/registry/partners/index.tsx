import type {PartnersComponentSchema} from '@open-formulieren/types';

import Partners from '@/components/forms/Partners';
import type {RegistryEntry} from '@/registry/types';

export interface PartnersFieldProps {
  componentDefinition: PartnersComponentSchema;
}

export const PartnersField: React.FC<PartnersFieldProps> = ({
  componentDefinition: {key, label, description, tooltip},
}) => {
  return <Partners name={key} label={label} description={description} tooltip={tooltip} />;
};

const PartnersComponent: RegistryEntry<PartnersComponentSchema> = {
  formField: PartnersField,
  // @TODO
  // valueDisplay: ValueDisplay,
  // getInitialValues,
  // getValidationSchema,
};

export default PartnersComponent;
