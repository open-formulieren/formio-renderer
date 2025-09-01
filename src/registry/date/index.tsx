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
  componentDefinition: {
    key,
    label,
    tooltip,
    description,
    validate,
    // @ts-expect-error the 'widget' prop is not in the component schema yet, but it does exist in
    // the formio configuration already.
    widget,
    datePicker,
  },
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
      // Default to date picker because the formio configuration default seems to be 'calendar'
      widget={['datePicker', 'inputGroup'].includes(widget?.type) ? widget.type : 'datePicker'}
      widgetProps={{
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
