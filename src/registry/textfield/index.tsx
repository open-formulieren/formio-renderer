import type {TextFieldComponentSchema} from '@open-formulieren/types';

import MultiField from '@/components/forms/MultiField';
import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioTextFieldProps {
  componentDefinition: TextFieldComponentSchema;
}

export const FormioTextField: React.FC<FormioTextFieldProps> = ({componentDefinition}) => {
  const {key, label, description, tooltip, placeholder, validate, disabled} = componentDefinition;

  const sharedProps: Pick<
    React.ComponentProps<typeof TextField>,
    'name' | 'label' | 'description' | 'tooltip' | 'isRequired' | 'isDisabled'
  > = {
    name: key,
    label,
    description,
    tooltip,
    isRequired: validate?.required,
    isDisabled: disabled,
  };
  return componentDefinition.multiple ? (
    <MultiField<string>
      {...sharedProps}
      newItemValue=""
      renderField={({name, label}) => (
        <TextField name={name} label={label} placeholder={placeholder} isMultiValue />
      )}
    />
  ) : (
    <TextField {...sharedProps} placeholder={placeholder} />
  );
};

const TextFieldComponent: RegistryEntry<TextFieldComponentSchema> = {
  formField: FormioTextField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default TextFieldComponent;
