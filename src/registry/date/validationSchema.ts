import type {DateComponentSchema} from '@open-formulieren/types';
import {endOfDay, isValid, parseISO, startOfDay} from 'date-fns';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildRequiredMessage} from '@/validationSchemas/errorMessages';

const INVALID_INPUT_MESSAGE = defineMessage({
  description: 'Invalid input validation error for date field',
  defaultMessage: 'The date must be in a valid format (e.g., 10/30/2025).',
});

const DATE_GREATER_THAN_MAX_DATE_MESSAGE = defineMessage({
  description: 'Validation error for date less than or equal to maximum date.',
  defaultMessage: 'The date must be earlier than or equal to {max}.',
});

const DATE_LESS_THAN_MIN_DATE_MESSAGE = defineMessage({
  description: 'Validation error for date greater than or equal to minimum date.',
  defaultMessage: 'The date must be later than or equal to {min}.',
});

const getValidationSchema: GetValidationSchema<DateComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, datePicker, multiple, errors, label} = componentDefinition;
  const {required, plugins = []} = validate;
  // In the backend, we set/grab the min and max dates from the `datePicker` property, so we also
  // need to do this here. Once we swapped formio for our own renderer - and also implemented
  // support in the form builder for choosing which widget to use - the min and max dates should be
  // moved to either the `validate` or `openForms` prop, probably.
  const minDate = datePicker?.minDate;
  const maxDate = datePicker?.maxDate;

  const formatDate = (dateValue: Date): string =>
    intl.formatDate(dateValue, {
      year: 'numeric',
      day: 'numeric',
      month: 'long',
    });

  const requiredMessage = errors?.required || buildRequiredMessage(intl, {fieldLabel: label});
  const invalidDateMessage = errors?.invalid_date || intl.formatMessage(INVALID_INPUT_MESSAGE);

  let dateSchema = z.coerce.date();
  if (minDate) {
    const minBoundary = startOfDay(parseISO(minDate));
    dateSchema = dateSchema.min(minBoundary, {
      message:
        errors?.minDate ||
        intl.formatMessage(DATE_LESS_THAN_MIN_DATE_MESSAGE, {min: formatDate(minBoundary)}),
    });
  }
  if (maxDate) {
    const maxBoundary = endOfDay(parseISO(maxDate));
    dateSchema = dateSchema.max(maxBoundary, {
      message:
        errors?.maxDate ||
        intl.formatMessage(DATE_GREATER_THAN_MAX_DATE_MESSAGE, {
          max: formatDate(maxBoundary),
        }),
    });
  }

  let innerSchema: z.ZodFirstPartySchemaTypes = z
    .string({required_error: requiredMessage})
    .refine(
      value => {
        const parsed = parseISO(value);
        return isValid(parsed);
      },
      {message: invalidDateMessage}
    )
    .pipe(dateSchema);

  if (!required) {
    innerSchema = innerSchema.optional();
  }

  let schema: z.ZodFirstPartySchemaTypes = z.preprocess((value: unknown) => {
    // `null` is the empty date value, cast it to undefined as that wat zod expects
    // for 'no value provided' to trigger the 'required' error
    if (value === null) return undefined;
    return value;
  }, innerSchema);

  if (plugins.length) {
    schema = schema.superRefine(async (val, ctx) => {
      const message = await validatePlugins(plugins, val);
      if (!message) return;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: message,
      });
    });
  }

  if (multiple) {
    let arraySchema = z.array(schema);

    if (required) {
      arraySchema = arraySchema.min(1, {message: requiredMessage});
    }

    schema = arraySchema;
  }

  return {[key]: schema};
};

export default getValidationSchema;
