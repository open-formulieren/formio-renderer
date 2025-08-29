import type {DateComponentSchema} from '@open-formulieren/types';

import {DateField} from '@/components/forms';
import {parseDate} from '@/components/forms/DateField/utils';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioDateProps {
  componentDefinition: DateComponentSchema;
}

export const FormioDate: React.FC<FormioDateProps> = ({
  // TODO-82: widget should be properly type hinted in our types. It currently already
  //  exists in the formio configuration actually
  componentDefinition: {key, label, tooltip, description, validate, widget, datePicker},
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
      widget={widget}
      datePickerProps={{
        maxDate: parsedMax ?? undefined,
        minDate: parsedMin ?? undefined,
      }}
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
