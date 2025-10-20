import type {DateComponentSchema} from '@open-formulieren/types';

import {DateField} from '@/components/forms';
import {parseDate} from '@/components/forms/DateField/utils';
import MultiField from '@/components/forms/MultiField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioDateProps {
  componentDefinition: DateComponentSchema;
}

export const FormioDate: React.FC<FormioDateProps> = ({componentDefinition}) => {
  const {key, label, tooltip, description, validate, openForms, datePicker, disabled} =
    componentDefinition;

  const parsedMax = datePicker?.maxDate ? parseDate(datePicker.maxDate) : null;
  const parsedMin = datePicker?.minDate ? parseDate(datePicker.minDate) : null;
  const widget = openForms?.widget ?? 'datePicker';

  const sharedProps: Pick<
    React.ComponentProps<typeof DateField>,
    'name' | 'label' | 'description' | 'tooltip' | 'isRequired' | 'isDisabled'
  > = {
    name: key,
    label,
    description,
    tooltip,
    isRequired: validate?.required,
    isDisabled: disabled,
  };

  return componentDefinition.multiple ? (
    <MultiField<string>
      {...sharedProps}
      newItemValue=""
      renderField={({name, label}) => (
        <DateField
          name={name}
          label={label}
          widget={widget}
          widgetProps={
            widget === 'datePicker'
              ? {
                  maxDate: parsedMax ?? undefined,
                  minDate: parsedMin ?? undefined,
                }
              : undefined
          }
          isMultiValue
        />
      )}
    />
  ) : (
    <DateField
      {...sharedProps}
      widget={widget}
      widgetProps={
        widget === 'datePicker'
          ? {
              maxDate: parsedMax ?? undefined,
              minDate: parsedMin ?? undefined,
            }
          : undefined
      }
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
