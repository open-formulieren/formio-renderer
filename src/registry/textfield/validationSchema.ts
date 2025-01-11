import type {TextFieldComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const getValidationSchema: GetValidationSchema<TextFieldComponentSchema> = componentDefinition => {
  const {key, validate = {}} = componentDefinition;
  const {required, maxLength, pattern} = validate;

  let schema: z.ZodString | z.ZodOptional<z.ZodString> = z.string();
  if (maxLength !== undefined) schema = schema.max(maxLength);
  if (pattern) schema = schema.regex(new RegExp(pattern));
  if (!required) schema = schema.optional();

  return {[key]: schema};
};

export default getValidationSchema;
