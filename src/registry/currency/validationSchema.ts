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
  intl
) => {
  const {key, validate, currency} = componentDefinition;
  const required = validate?.required;
  const max = validate?.max;
  const min = validate?.min;

  const numberFormat = new Intl.NumberFormat(intl.locale, {style: 'currency', currency});
  const maxFormatted = max && numberFormat.format(max);
  const minFormatted = min && numberFormat.format(min);

  const isLessThanOrEqualToMaximum = (value: number | null): boolean => {
    if (max === undefined || value === null) return true;
    return value <= max;
  };

  const isGreaterThanOrEqualToMinimum = (value: number | null): boolean => {
    if (min === undefined || value === null) return true;
    return value >= min;
  };

  let schema: z.ZodFirstPartySchemaTypes = z
    .number()
    .nullable() // null is also a valid value
    .refine(isLessThanOrEqualToMaximum, {
      message: intl.formatMessage(NUMBER_GREATER_THAN_MAX_MESSAGE, {max: maxFormatted}),
    })
    .refine(isGreaterThanOrEqualToMinimum, {
      message: intl.formatMessage(NUMBER_LESS_THAN_MIN_MESSAGE, {min: minFormatted}),
    });
  if (!required) schema = schema.optional();

  // For numbers, a missing value is null, which doesn't trigger the required validation of zod,
  // so we set it to undefined manually
  return {[key]: z.preprocess(value => (value === null && required ? undefined : value), schema)};
};

export default getValidationSchema;
