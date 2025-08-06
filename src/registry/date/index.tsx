import type {DateComponentSchema} from '@open-formulieren/types';

import {DateField} from '@/components/forms';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioDateProps {
  componentDefinition: DateComponentSchema;
}

export const FormioDate: React.FC<FormioDateProps> = ({
  componentDefinition: {key, label, tooltip, description, validate},
}) => {
  return (
    <DateField
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
      widget="inputGroup"
    />
  );
};

const DateComponent: RegistryEntry<DateComponentSchema> = {
  formField: FormioDate,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default DateComponent;
