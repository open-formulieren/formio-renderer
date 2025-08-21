import type {CosignV2ComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioCosignProps {
  componentDefinition: CosignV2ComponentSchema;
}

export const FormioCosign: React.FC<FormioCosignProps> = ({
  componentDefinition: {key, label, description, tooltip, validate, autocomplete},
}) => {
  return (
    <TextField
      name={key}
      type="email"
      label={label}
      description={description}
      tooltip={tooltip}
      isRequired={validate?.required}
      autoComplete={autocomplete}
    />
  );
};

const CosignComponent: RegistryEntry<CosignV2ComponentSchema> = {
  formField: FormioCosign,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
};

export default CosignComponent;
