import type {DateComponentSchema} from '@open-formulieren/types';
import {isValid, parseISO} from 'date-fns';
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

  let dateSchema = z.coerce.date();
  if (minDate) {
    dateSchema = dateSchema.min(parseISO(minDate), {
      message:
        errors?.minDate || intl.formatMessage(DATE_LESS_THAN_MIN_DATE_MESSAGE, {min: minDate}),
    });
  }
  if (maxDate) {
    dateSchema = dateSchema.max(parseISO(maxDate), {
      message:
        errors?.maxDate || intl.formatMessage(DATE_GREATER_THAN_MAX_DATE_MESSAGE, {max: maxDate}),
    });
  }

  let schema: z.ZodFirstPartySchemaTypes = z
    .string({
      required_error: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
    })
    .refine(
      value => {
        const parsed = parseISO(value);
        return isValid(parsed);
      },
      {message: errors?.invalid_date || intl.formatMessage(INVALID_INPUT_MESSAGE)}
    )
    .pipe(dateSchema);

  if (!required) {
    schema = schema.optional().or(z.literal(''));
  }

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
      arraySchema = arraySchema.min(1, {
        message: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
      });
    }

    schema = arraySchema;
  }

  return {[key]: schema};
};

export default getValidationSchema;
