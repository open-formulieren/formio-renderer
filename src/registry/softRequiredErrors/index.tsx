import type {SoftRequiredErrorsComponentSchema} from '@open-formulieren/types';

import SoftRequiredErrors from '@/components/forms/SoftRequiredErrors';
import type {GetRegistryEntry, RegistryEntry} from '@/registry/types';

export interface FormioSoftRequiredErrorsProps {
  componentDefinition: SoftRequiredErrorsComponentSchema;
  getRegistryEntry: GetRegistryEntry;
}

export const FormioSoftRequiredErrors: React.FC<FormioSoftRequiredErrorsProps> = ({
  componentDefinition: {html},
  getRegistryEntry,
}) => {
  return <SoftRequiredErrors html={html} getRegistryEntry={getRegistryEntry} />;
};

const SoftRequiredErrorsComponent: RegistryEntry<SoftRequiredErrorsComponentSchema> = {
  formField: FormioSoftRequiredErrors,
};

export default SoftRequiredErrorsComponent;
