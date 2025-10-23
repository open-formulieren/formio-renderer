import type {PhoneNumberComponentSchema} from '@open-formulieren/types';

import MultiField from '@/components/forms/MultiField';
import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface PhoneNumberFieldProps {
  componentDefinition: PhoneNumberComponentSchema;
}

/**
 * A component to enter phone numbers.
 *
 * @todo - this is deprecated in the Open-Forms-SDk - check what we can do with this
 * component.
 * @deprecated - ideally we should be able to use textfield with the appropriate
 * validators.
 */
export const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({componentDefinition}) => {
  const {key, label, tooltip, description, validate, placeholder, autocomplete, disabled} =
    componentDefinition;
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
        <TextField
          name={name}
          label={label}
          placeholder={placeholder}
          pattern="^[+0-9][\- 0-9]+$"
          inputMode="tel"
          autoComplete={autocomplete}
          isMultiValue
        />
      )}
    />
  ) : (
    <TextField
      {...sharedProps}
      placeholder={placeholder}
      pattern="^[+0-9][\- 0-9]+$"
      inputMode="tel"
      autoComplete={autocomplete}
    />
  );
};

const PhoneNumberComponent: RegistryEntry<PhoneNumberComponentSchema> = {
  formField: PhoneNumberField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default PhoneNumberComponent;
