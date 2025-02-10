import type {DateComponentSchema} from '@open-formulieren/types';

import {DateField} from '@/components/forms';
import type {RegistryEntry} from '@/registry/types';

import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioDateProps {
  componentDefinition: DateComponentSchema;
}

export const FormioDate: React.FC<FormioDateProps> = ({
  componentDefinition: {key, label, description, validate},
}) => {
  return (
    <DateField
      name={key}
      label={label}
      description={description}
      isRequired={validate?.required}
      widget="inputGroup"
    />
  );
};

const DateComponent: RegistryEntry<DateComponentSchema> = {
  formField: FormioDate,
  getInitialValues,
  getValidationSchema,
};

export default DateComponent;
