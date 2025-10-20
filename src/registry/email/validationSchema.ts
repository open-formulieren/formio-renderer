import type {EmailComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const getValidationSchema: GetValidationSchema<EmailComponentSchema> = componentDefinition => {
  const {key, validate, multiple} = componentDefinition;
  const required = validate?.required;

  let schema: z.ZodFirstPartySchemaTypes = z.string().email();

  if (required) {
    schema = schema.min(1);
  } else {
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
