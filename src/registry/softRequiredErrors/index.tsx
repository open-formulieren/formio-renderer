import type {SoftRequiredErrorsComponentSchema} from '@open-formulieren/types';

import SoftRequiredErrors from '@/components/forms/SoftRequiredErrors';
import type {RegistryEntry} from '@/registry/types';

export interface FormioSoftRequiredErrorsProps {
  componentDefinition: SoftRequiredErrorsComponentSchema;
}

export const FormioSoftRequiredErrors: React.FC<FormioSoftRequiredErrorsProps> = ({
  componentDefinition: {html},
}) => {
  return <SoftRequiredErrors html={html} />;
};

const SoftRequiredErrorsComponent: RegistryEntry<SoftRequiredErrorsComponentSchema> = {
  formField: FormioSoftRequiredErrors,
};

export default SoftRequiredErrorsComponent;
