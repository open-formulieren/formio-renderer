import type {TimeComponentSchema} from '@open-formulieren/types';

import {TextField} from '@/components/forms';
import MultiField from '@/components/forms/MultiField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface TimeFieldProps {
  componentDefinition: TimeComponentSchema;
}

export const TimeField: React.FC<TimeFieldProps> = ({componentDefinition}) => {
  const {key, label, description, tooltip, validate, disabled} = componentDefinition;
  const sharedProps: Pick<
    React.ComponentProps<typeof TextField>,
    'name' | 'label' | 'description' | 'tooltip' | 'isRequired' | 'isReadOnly'
  > = {
    name: key,
    label,
    description,
    tooltip,
    isRequired: validate?.required,
    isReadOnly: disabled,
  };
  return componentDefinition.multiple ? (
    <MultiField<string>
      {...sharedProps}
      newItemValue=""
      renderField={({name, label, isReadOnly}) => (
        <TextField
          name={name}
          label={label}
          min={validate?.minTime ?? undefined}
          max={validate?.maxTime ?? undefined}
          isReadOnly={isReadOnly}
          type="time"
          step="60"
          isMultiValue
        />
      )}
    />
  ) : (
    <TextField
      {...sharedProps}
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
