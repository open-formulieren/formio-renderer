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
  intl
) => {
  const {key, validate = {}} = componentDefinition;
  // FIXME: minDate and maxDate are typed as any in Formio's types!
  // TODO-82: in the backend, we set 'minDate' and 'maxDate' to the 'datePicker' prop. Is it correct
  //  fetching them from 'validate'? Also in the requirements of the datepicker ticket, minDate and
  //  maxDate are listed under the datePicker prop. Seems like validation will not be applied when
  //  we swap the component
  const {required, minDate, maxDate} = validate;

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

  return {[key]: schema};
};

export default getValidationSchema;
