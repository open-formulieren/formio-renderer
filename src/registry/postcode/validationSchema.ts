import type {PostcodeComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const POSTCODE_PATTERN: PostcodeComponentSchema['validate']['pattern'] =
  '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$';
const POSTCODE_REGEX = new RegExp(POSTCODE_PATTERN);

const POSTCODE_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for postcode.',
  defaultMessage: 'The submitted value does not match the postcode pattern: 1234 AB',
});

const getValidationSchema: GetValidationSchema<PostcodeComponentSchema> = (
  componentDefinition,
  intl
) => {
  const {key, validate, multiple} = componentDefinition;
  const required = validate?.required;

  let schema: z.ZodFirstPartySchemaTypes = z
    .string()
    .regex(POSTCODE_REGEX, {message: intl.formatMessage(POSTCODE_INVALID_MESSAGE)});
  if (!required) schema = schema.or(z.literal('')).optional();

  if (multiple) {
    schema = z.array(schema);
    if (required) {
      schema = schema.min(1);
    }
  }

  return {[key]: schema};
};

export default getValidationSchema;
