import type {BsnComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioBSNProps {
  componentDefinition: BsnComponentSchema;
}

export const FormioBSN: React.FC<FormioBSNProps> = ({
  componentDefinition: {key, label, tooltip, description, validate},
}) => {
  return (
    <TextField
      name={key}
      type="text"
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
      pattern="[0-9]{9}"
      inputMode="numeric"
      placeholder="XXXXXXXXX"
    />
  );
};

const BSNComponent: RegistryEntry<BsnComponentSchema> = {
  formField: FormioBSN,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
};

export default BSNComponent;
