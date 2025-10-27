import type {CurrencyComponentSchema} from '@open-formulieren/types';
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

const getValidationSchema: GetValidationSchema<CurrencyComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, currency} = componentDefinition;
  const {required, min, max, plugins = []} = validate;

  const numberFormat = new Intl.NumberFormat(intl.locale, {style: 'currency', currency});
  const maxFormatted = max && numberFormat.format(max);
  const minFormatted = min && numberFormat.format(min);

  let schema: z.ZodFirstPartySchemaTypes = z.number();
  if (max !== undefined)
    schema = schema.lte(max, {
      message: intl.formatMessage(NUMBER_GREATER_THAN_MAX_MESSAGE, {max: maxFormatted}),
    });
  if (min !== undefined)
    schema = schema.gte(min, {
      message: intl.formatMessage(NUMBER_LESS_THAN_MIN_MESSAGE, {min: minFormatted}),
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
