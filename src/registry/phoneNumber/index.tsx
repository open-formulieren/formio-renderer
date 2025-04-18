import type {PhoneNumberComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
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
export const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
  componentDefinition: {key, label, description, tooltip, placeholder, validate, autocomplete},
}) => {
  return (
    <TextField
      name={key}
      label={label}
      description={description}
      tooltip={tooltip}
      isRequired={validate?.required}
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
};

export default PhoneNumberComponent;
