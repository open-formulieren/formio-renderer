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
  intl
) => {
  const {key, validate} = componentDefinition;
  const required = validate?.required;
  const max = validate?.max;
  const min = validate?.min;

  let schema: z.ZodFirstPartySchemaTypes = z.number();
  if (max !== undefined)
    schema = schema.lte(max, {message: intl.formatMessage(NUMBER_GREATER_THAN_MAX_MESSAGE, {max})});
  if (min !== undefined)
    schema = schema.gte(min, {message: intl.formatMessage(NUMBER_LESS_THAN_MIN_MESSAGE, {min})});
  if (!required) schema = schema.nullable().optional();

  // For numbers, a missing value is null, which doesn't trigger the required validation of zod,
  // so we set it to undefined manually
  return {[key]: z.preprocess(value => (value === null && required ? undefined : value), schema)};
};

export default getValidationSchema;
