import type {RadioComponentSchema} from '@open-formulieren/types';

import RadioField from '@/components/forms/RadioField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import getInitialValues from './initialValues';
import {assertManualValues} from './types';
import getValidationSchema from './validationSchema';

export interface FormioRadioFieldProps {
  componentDefinition: RadioComponentSchema;
}

export const FormioRadioField: React.FC<FormioRadioFieldProps> = ({componentDefinition}) => {
  assertManualValues(componentDefinition);
  const {key, label, tooltip, description, validate = {}, values} = componentDefinition;
  const {required = false} = validate;
  return (
    <RadioField
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={required}
      options={values}
    />
  );
};

const RadioComponent: RegistryEntry<RadioComponentSchema> = {
  formField: FormioRadioField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
};

export default RadioComponent;
