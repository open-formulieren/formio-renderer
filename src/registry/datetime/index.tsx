import type {DateTimeComponentSchema} from '@open-formulieren/types';

import {DateField} from '@/components/forms';
import {parseDate} from '@/components/forms/DateField/utils';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioDateTimeProps {
  componentDefinition: DateTimeComponentSchema;
}

// TODO-83: what to use as a time input? Formio uses spinboxes to select the time, but we also have
//  our own time field.
//  Sergei: should be two number input fields, which should already include the arrow buttons to
//  select a value.
export const FormioDateTime: React.FC<FormioDateTimeProps> = ({
  componentDefinition: {key, label, tooltip, description, validate, datePicker},
}) => {
  const parsedMax = datePicker?.maxDate ? parseDate(datePicker.maxDate) : null;
  const parsedMin = datePicker?.minDate ? parseDate(datePicker.minDate) : null;
  return (
    <DateField
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
      widget="dateTimePicker"
      widgetProps={{
        maxDate: parsedMax ?? undefined,
        minDate: parsedMin ?? undefined,
      }}
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
