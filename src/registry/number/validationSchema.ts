import type {NumberComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const NUMBER_GREATER_THAN_MAX_MESSAGE = defineMessage({
  description: 'Validation error for number greater than maximum value.',
  defaultMessage: 'The value must be {max} or less.',
});

const NUMBER_LESS_THAN_MIN_MESSAGE = defineMessage({
  description: 'Validation error for number less than minimum value.',
  defaultMessage: 'The value must be {min} or greater.',
});

const getValidationSchema: GetValidationSchema<NumberComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, errors} = componentDefinition;
  const {required, plugins = []} = validate;
  const max = validate?.max;
  const min = validate?.min;

  let schema: z.ZodFirstPartySchemaTypes = z.number({required_error: errors?.required});

  if (max !== undefined)
    schema = schema.lte(max, {
      message: errors?.max || intl.formatMessage(NUMBER_GREATER_THAN_MAX_MESSAGE, {max}),
    });
  if (min !== undefined)
    schema = schema.gte(min, {
      message: errors?.min || intl.formatMessage(NUMBER_LESS_THAN_MIN_MESSAGE, {min}),
    });
  if (!required) schema = schema.nullable().optional();

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
  // For numbers, a missing value is null, which doesn't trigger the required validation of zod,
  // so we set it to undefined manually
  schema = z.preprocess(value => (value === null && required ? undefined : value), schema);

  return {[key]: schema};
};

export default getValidationSchema;
