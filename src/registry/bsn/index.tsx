import type {BsnComponentSchema} from '@open-formulieren/types';

import MultiField from '@/components/forms/MultiField';
import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioBSNProps {
  componentDefinition: BsnComponentSchema;
}

export const FormioBSN: React.FC<FormioBSNProps> = ({componentDefinition}) => {
  const {key, label, tooltip, description, validate, disabled} = componentDefinition;
  const sharedProps: Pick<
    React.ComponentProps<typeof TextField>,
    'name' | 'label' | 'description' | 'tooltip' | 'isRequired' | 'isReadOnly'
  > = {
    name: key,
    label,
    description,
    tooltip,
    isRequired: validate?.required,
    isReadOnly: disabled,
  };

  return componentDefinition.multiple ? (
    <MultiField<string>
      {...sharedProps}
      newItemValue=""
      renderField={({name, label, isReadOnly}) => (
        <TextField
          name={name}
          label={label}
          type="text"
          pattern="[0-9]{9}"
          inputMode="numeric"
          placeholder="XXXXXXXXX"
          isReadOnly={isReadOnly}
          isMultiValue
        />
      )}
    />
  ) : (
    <TextField
      {...sharedProps}
      type="text"
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
  isEmpty,
};

export default BSNComponent;
