import type {PostcodeComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const POSTAL_CODE_PATTERN: PostcodeComponentSchema['validate']['pattern'] =
  '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$';
const POSTAL_CODE_REGEX = new RegExp(POSTAL_CODE_PATTERN);

const POSTAL_CODE_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for postal code.',
  defaultMessage: 'Invalid Dutch postal code',
});

const getValidationSchema: GetValidationSchema<PostcodeComponentSchema> = (
  componentDefinition,
  intl
) => {
  const {key, validate} = componentDefinition;
  const required = validate?.required;

  let schema: z.ZodFirstPartySchemaTypes = z
    .string()
    .regex(POSTAL_CODE_REGEX, {message: intl.formatMessage(POSTAL_CODE_INVALID_MESSAGE)});
  if (!required) schema = schema.or(z.literal('')).optional();

  return {[key]: schema};
};

export default getValidationSchema;
