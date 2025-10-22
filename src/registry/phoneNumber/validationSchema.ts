import type {PhoneNumberComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const PHONE_NUMBER_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for phone number format.',
  defaultMessage:
    'Invalid phone number - a phone number may only contain digits, the + or - sign or spaces',
});

const getValidationSchema: GetValidationSchema<PhoneNumberComponentSchema> = (
  componentDefinition,
  {intl}
) => {
  const {key, validate = {}, multiple} = componentDefinition;
  const {required, pattern} = validate;

  // base phone number shape - a more narrow pattern can be specified in the form builder
  let schema: z.ZodFirstPartySchemaTypes = z
    .string()
    .regex(/^[+0-9][- 0-9]+$/, {message: intl.formatMessage(PHONE_NUMBER_INVALID_MESSAGE)});

  if (pattern) {
    let normalizedPattern = pattern;
    // Formio implicitly adds the ^ and $ markers to consider the whole value
    if (!normalizedPattern.startsWith('^')) normalizedPattern = `^${normalizedPattern}`;
    if (!normalizedPattern.endsWith('$')) normalizedPattern = `${normalizedPattern}$`;
    schema = schema.regex(new RegExp(normalizedPattern));
  }

  if (required) {
    schema = schema.min(1);
  } else {
    schema = schema.optional().or(z.literal(''));
  }

  if (multiple) {
    schema = z.array(schema);
    if (required) {
      schema = schema.min(1);
    }
  }

  return {[key]: schema};
};

export default getValidationSchema;
