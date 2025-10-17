import type {TimeComponentSchema} from '@open-formulieren/types';

import {TextField} from '@/components/forms';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface TimeFieldProps {
  componentDefinition: TimeComponentSchema;
}

export const TimeField: React.FC<TimeFieldProps> = ({
  componentDefinition: {key, label, description, tooltip, validate},
}) => {
  return (
    <TextField
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
      min={validate?.minTime ?? undefined}
      max={validate?.maxTime ?? undefined}
      type="time"
      step="60"
    />
  );
};

const TimeFieldComponent: RegistryEntry<TimeComponentSchema> = {
  formField: TimeField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default TimeFieldComponent;
