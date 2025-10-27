import type {BsnComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildBsnValidationSchema} from '@/validationSchemas/bsn';

const getValidationSchema: GetValidationSchema<BsnComponentSchema> = (
  componentDefinition,
  intl
) => {
  const {key, validate, multiple} = componentDefinition;
  const required = validate?.required;

  // TODO: localize!
  let schema: z.ZodFirstPartySchemaTypes = buildBsnValidationSchema(intl);
  if (!required) {
    schema = schema.or(z.literal('')).optional();
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
