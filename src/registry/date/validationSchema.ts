import type {DateComponentSchema} from '@open-formulieren/types';
import {isValid, parseISO} from 'date-fns';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const INVALID_INPUT_MESSAGE = defineMessage({
  description: 'Invalid input validation error for date field',
  defaultMessage: 'Invalid input',
});

const getValidationSchema: GetValidationSchema<DateComponentSchema> = (
  componentDefinition,
  {intl}
) => {
  const {key, validate = {}, datePicker, multiple} = componentDefinition;
  const {required} = validate;
  // In the backend, we set/grab the min and max dates from the `datePicker` property, so we also
  // need to do this here. Once we swapped formio for our own renderer - and also implemented
  // support in the form builder for choosing which widget to use - the min and max dates should be
  // moved to either the `validate` or `openForms` prop, probably.
  const minDate = datePicker?.minDate;
  const maxDate = datePicker?.maxDate;

  let dateSchema = z.coerce.date();
  if (minDate) {
    dateSchema = dateSchema.min(parseISO(minDate));
  }
  if (maxDate) {
    dateSchema = dateSchema.max(parseISO(maxDate));
  }

  let schema: z.ZodFirstPartySchemaTypes = z
    .string()
    .refine(
      value => {
        const parsed = parseISO(value);
        return isValid(parsed);
      },
      {message: intl.formatMessage(INVALID_INPUT_MESSAGE)}
    )
    .pipe(dateSchema);

  if (!required) {
    schema = z.union([schema, z.literal('')]).optional();
  }

  if (multiple) {
    schema = z.array(schema);
    if (required) {
      schema = schema.min(1);
    }
  }

  return {[key]: schema};
};

export default getValidationSchema;
