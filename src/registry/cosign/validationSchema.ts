import type {CosignV2ComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const getValidationSchema: GetValidationSchema<CosignV2ComponentSchema> = componentDefinition => {
  const {key, validate} = componentDefinition;
  const required = validate?.required;

  let schema: z.ZodFirstPartySchemaTypes = z.string().email();

  if (required) {
    schema = schema.min(1);
  } else {
    schema = schema.or(z.literal('')).optional();
  }

  return {[key]: schema};
};

export default getValidationSchema;
