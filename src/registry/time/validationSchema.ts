import type {TimeComponentSchema} from '@open-formulieren/types';
import {parse} from 'date-fns';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildRequiredMessage} from '@/validationSchemas/errorMessages';

const TIME_STRUCTURE_MESSAGE = defineMessage({
  description: 'Validation error describing shape of time format.',
  defaultMessage: 'Hour must be between 0-23 and minute between 0-59',
});

const TIME_MIN_MESSAGE = defineMessage({
  description: 'Validation error describing the value is not after the minimum time.',
  defaultMessage: 'Time must be after {minTime}',
});

const TIME_MAX_MESSAGE = defineMessage({
  description: 'Validation error describing the value is not before the maximum time.',
  defaultMessage: 'Time must be before {maxTime}',
});

const TIME_PERIOD_MESSAGE = defineMessage({
  description:
    'Validation error describing the value is not in-between the minimum and maximum time.',
  defaultMessage: 'Time must be in-between {minTime} and {maxTime}',
});

const getValidationSchema: GetValidationSchema<TimeComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, multiple, errors, label} = componentDefinition;
  const {required, minTime, maxTime, plugins = []} = validate;

  let schema: z.ZodFirstPartySchemaTypes = z
    .string({
      message: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
    })
    .time({message: intl.formatMessage(TIME_STRUCTURE_MESSAGE)})
    .superRefine((value, ctx) => {
      const min = minTime ? parse(minTime, 'HH:mm', new Date()) : null;
      const max = maxTime ? parse(maxTime, 'HH:mm', new Date()) : null;
      const parsedValue = parse(value, 'HH:mm', new Date());

      // Case 1: only one boundary is given
      if (!min || !max) {
        if (min && parsedValue < min) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: errors?.minTime || intl.formatMessage(TIME_MIN_MESSAGE, {minTime}),
          });
        }

        if (max && parsedValue > max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: errors?.maxTime || intl.formatMessage(TIME_MAX_MESSAGE, {maxTime}),
          });
        }
      } else {
        // Case 2: min boundary is smaller than max boundary
        if (min < max) {
          const isTooEarly = parsedValue < min;
          const isTooLate = parsedValue > max;

          if (isTooEarly || isTooLate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                errors?.invalid_time || intl.formatMessage(TIME_PERIOD_MESSAGE, {minTime, maxTime}),
            });
          }
        } else {
          // Case 3: min boundary is bigger than max boundary (it's the next day. For example min = 08:00, max = 01:00)
          if (parsedValue > max && parsedValue < min) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                errors?.invalid_time || intl.formatMessage(TIME_PERIOD_MESSAGE, {minTime, maxTime}),
            });
          }
        }
      }
    });

  if (!required) {
    schema = schema.or(z.literal('')).optional();
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
    schema = z.array(schema);
    if (required) {
      schema = schema.min(1, {
        message: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
      });
    }
  }

  return {[key]: schema};
};

export default getValidationSchema;
