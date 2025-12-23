import type {DateTimeComponentSchema} from '@open-formulieren/types';
import {parseISO} from 'date-fns';

import {DateTimeField} from '@/components/forms';
import MultiField from '@/components/forms/MultiField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioDateTimeProps {
  componentDefinition: DateTimeComponentSchema;
}

export const FormioDateTime: React.FC<FormioDateTimeProps> = ({componentDefinition}) => {
  const {key, label, tooltip, description, validate, datePicker, disabled} = componentDefinition;

  const sharedProps: Pick<
    React.ComponentProps<typeof DateTimeField>,
    'name' | 'label' | 'description' | 'tooltip' | 'isRequired' | 'isReadOnly'
  > = {
    name: key,
    label,
    description,
    tooltip,
    isRequired: validate?.required,
    isReadOnly: disabled,
  };

  // Note: setting a max and min date in the form builder sets a value without the seconds in the
  // component definition (YYYY-MM-DDThh:mm). `parseISO` can deal with this.
  const parsedMax = datePicker?.maxDate ? parseISO(datePicker.maxDate) : null;
  const parsedMin = datePicker?.minDate ? parseISO(datePicker.minDate) : null;
  return componentDefinition.multiple ? (
    <MultiField<string>
      {...sharedProps}
      newItemValue=""
      renderField={({name, label, isReadOnly}) => (
        <DateTimeField
          name={name}
          label={label}
          maxDate={parsedMax ?? undefined}
          minDate={parsedMin ?? undefined}
          isReadOnly={isReadOnly}
          isMultiValue
        />
      )}
    />
  ) : (
    <DateTimeField
      {...sharedProps}
      maxDate={parsedMax ?? undefined}
      minDate={parsedMin ?? undefined}
    />
  );
};

const DateTimeComponent: RegistryEntry<DateTimeComponentSchema> = {
  formField: FormioDateTime,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default DateTimeComponent;
