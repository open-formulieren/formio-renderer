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
  {intl, validatePlugins}
) => {
  const {key, validate = {}, datePicker, multiple, errors} = componentDefinition;
  const {required, plugins = []} = validate;
  // In the backend, we set/grab the min and max dates from the `datePicker` property, so we also
  // need to do this here. Once we swapped formio for our own renderer - and also implemented
  // support in the form builder for choosing which widget to use - the min and max dates should be
  // moved to either the `validate` or `openForms` prop, probably.
  const minDate = datePicker?.minDate;
  const maxDate = datePicker?.maxDate;

  let dateSchema = z.coerce.date();

  if (minDate) {
    dateSchema = dateSchema.min(parseISO(minDate), {message: errors?.minDate});
  }

  if (maxDate) {
    dateSchema = dateSchema.max(parseISO(maxDate), {message: errors?.maxDate});
  }

  let stringSchema: z.ZodFirstPartySchemaTypes = z.string({required_error: errors?.required});

  stringSchema = stringSchema.refine(
    value => {
      if (!value && !required) return true;

      const parsed = parseISO(value);
      return isValid(parsed);
    },
    {message: errors?.invalid_date || intl.formatMessage(INVALID_INPUT_MESSAGE)}
  );

  let schema: z.ZodFirstPartySchemaTypes = stringSchema.pipe(dateSchema);

  if (!required) {
    schema = z.union([schema, z.literal(''), z.undefined()]);
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
      arraySchema = arraySchema.min(1, {message: errors?.required});
    }

    schema = arraySchema;
  }

  return {[key]: schema};
};

export default getValidationSchema;
