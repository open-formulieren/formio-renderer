import type {EmailComponentSchema} from '@open-formulieren/types';

import MultiField from '@/components/forms/MultiField';
import TextField from '@/components/forms/TextField';
import {useFieldConfig} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';
import {VerificationStatus} from './verification';

export interface FormioEmailProps {
  componentDefinition: EmailComponentSchema;
}

export const FormioEmail: React.FC<FormioEmailProps> = ({componentDefinition}) => {
  const {
    key,
    label,
    description,
    tooltip,
    validate,
    autocomplete,
    openForms = {translations: {}},
  } = componentDefinition;
  const prefixedKey = useFieldConfig(key);
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

  const isVerificationRequired = openForms.requireVerification ?? false;

  return componentDefinition.multiple ? (
    <MultiField<string>
      {...sharedProps}
      newItemValue=""
      renderField={({name, label}) => (
        <TextField name={name} label={label} type="email" autoComplete={autocomplete} isMultiValue>
          {isVerificationRequired && (
            <VerificationStatus prefixedComponentKey={prefixedKey} name={name} />
          )}
        </TextField>
      )}
    />
  ) : (
    <TextField {...sharedProps} type="email" autoComplete={autocomplete}>
      {isVerificationRequired && (
        <VerificationStatus prefixedComponentKey={prefixedKey} name={prefixedKey} />
      )}
    </TextField>
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
