import type {TimeComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const TIME_STRUCTURE_MESSAGE = defineMessage({
  description: 'Validation error describing shape of time format.',
  defaultMessage: 'Time must conform format HH:MM:SS',
});

const TIME_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for time that does not pass 24-hours format.',
  defaultMessage: 'Invalid time',
});

const TIME_PATTERN = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))/;

const getValidationSchema: GetValidationSchema<TimeComponentSchema> = (
  componentDefinition,
  intl
) => {
  const {key, validate = {}} = componentDefinition;
  const {required} = validate;

  let schema: z.ZodFirstPartySchemaTypes = z
    .string()
    .length(8, {message: intl.formatMessage(TIME_STRUCTURE_MESSAGE)})
    .regex(TIME_PATTERN, {message: intl.formatMessage(TIME_INVALID_MESSAGE)});

  if (!required) {
    schema = schema.or(z.literal('')).optional();
  }

  return {[key]: schema};
};

export default getValidationSchema;
