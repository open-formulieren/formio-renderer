import type {TimeComponentSchema} from '@open-formulieren/types';

import {TimeField} from '@/components/forms';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioTimeFieldProps {
  componentDefinition: TimeComponentSchema;
}

export const FormioTimeField: React.FC<FormioTimeFieldProps> = ({
  componentDefinition: {key, label, description, tooltip, validate},
}) => {
  return (
    <TimeField
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
    />
  );
};

const TimeFieldComponent: RegistryEntry<TimeComponentSchema> = {
  formField: FormioTimeField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default TimeFieldComponent;
