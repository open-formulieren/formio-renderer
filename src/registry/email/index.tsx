import type {EmailComponentSchema} from '@open-formulieren/types';

import MultiField from '@/components/forms/MultiField';
import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioEmailProps {
  componentDefinition: EmailComponentSchema;
}

export const FormioEmail: React.FC<FormioEmailProps> = ({componentDefinition}) => {
  const {key, label, description, tooltip, placeholder, validate, autocomplete} =
    componentDefinition;
  const sharedProps: Pick<
    React.ComponentProps<typeof TextField>,
    'name' | 'label' | 'description' | 'tooltip' | 'isRequired'
  > = {
    name: key,
    label,
    description,
    tooltip,
    isRequired: validate?.required,
  };
  return componentDefinition.multiple ? (
    <MultiField<string>
      {...sharedProps}
      newItemValue=""
      renderField={({name, label}) => (
        <TextField
          name={name}
          label={label}
          type="email"
          placeholder={placeholder}
          autoComplete={autocomplete}
          isMultiValue
        />
      )}
    />
  ) : (
    <TextField
      {...sharedProps}
      type="email"
      placeholder={placeholder}
      autoComplete={autocomplete}
    />
  );
};

const EmailComponent: RegistryEntry<EmailComponentSchema> = {
  formField: FormioEmail,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default EmailComponent;
