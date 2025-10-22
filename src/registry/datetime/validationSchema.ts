import type {DateTimeComponentSchema} from '@open-formulieren/types';
import {isValid, parseISO} from 'date-fns';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const DATETIME_INVALID_MESSAGE = defineMessage({
  description: 'Invalid input validation error for datetime field',
  defaultMessage: `The datetime must consist of a date and a time stamp, separated by a space
  (e.g. 10/30/2025 5:34 PM).`,
});

const DATETIME_GREATER_THAN_MAX_DATE_MESSAGE = defineMessage({
  description: 'Validation error for datetime greater than maximum date.',
  defaultMessage: 'The datetime must be earlier than or equal to {max}.',
});

const DATETIME_LESS_THAN_MIN_DATE_MESSAGE = defineMessage({
  description: 'Validation error for datetime less than minimum date.',
  defaultMessage: 'The datetime must be later than or equal to {min}.',
});

const getValidationSchema: GetValidationSchema<DateTimeComponentSchema> = (
  componentDefinition,
  intl
) => {
  const {key, validate = {}, datePicker} = componentDefinition;
  const {required} = validate;
  // In the backend, we set/grab the min and max dates from the `datePicker` property, so we also
  // need to do this here. Once we swapped formio for our own renderer - and also implemented
  // support in the form builder for choosing which widget to use - the min and max dates should be
  // moved to either the `validate` or `openForms` prop, probably.
  // Note: setting a max and min date in the form builder sets a value without the seconds in the
  // component definition (YYYY-MM-DDThh:mm). `parseISO` can deal with this.
  const minDate = datePicker?.minDate ? parseISO(datePicker.minDate) : null;
  const maxDate = datePicker?.maxDate ? parseISO(datePicker.maxDate) : null;

  let dateSchema = z.coerce.date();
  if (minDate) {
    const minDateString = intl.formatDate(minDate, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    dateSchema = dateSchema.min(minDate, {
      message: intl.formatMessage(DATETIME_LESS_THAN_MIN_DATE_MESSAGE, {min: minDateString}),
    });
  }
  if (maxDate) {
    const maxDateString = intl.formatDate(maxDate, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    dateSchema = dateSchema.max(maxDate, {
      message: intl.formatMessage(DATETIME_GREATER_THAN_MAX_DATE_MESSAGE, {max: maxDateString}),
    });
  }

  let schema: z.ZodFirstPartySchemaTypes = z
    .string()
    .refine(
      value => {
        const parsed = parseISO(value);
        return isValid(parsed);
      },
      {message: intl.formatMessage(DATETIME_INVALID_MESSAGE)}
    )
    .pipe(dateSchema);

  if (!required) {
    schema = z.union([schema, z.literal('')]).optional();
  }

  return {[key]: schema};
};

export default getValidationSchema;
