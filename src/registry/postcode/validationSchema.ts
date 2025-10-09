import type {PostcodeComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const POSTCODE_PATTERN: PostcodeComponentSchema['validate']['pattern'] =
  '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$';
const POSTCODE_REGEX = new RegExp(POSTCODE_PATTERN);

const POSTCODE_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for postcode.',
  defaultMessage: 'Invalid Dutch postcode',
});

const getValidationSchema: GetValidationSchema<PostcodeComponentSchema> = (
  componentDefinition,
  intl
) => {
  const {key, validate} = componentDefinition;
  const required = validate?.required;

  let schema: z.ZodFirstPartySchemaTypes = z
    .string()
    .regex(POSTCODE_REGEX, {message: intl.formatMessage(POSTCODE_INVALID_MESSAGE)});
  if (!required) schema = schema.or(z.literal('')).optional();

  return {[key]: schema};
};

export default getValidationSchema;
