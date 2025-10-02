import type {TextFieldComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

// TODO: show a custom error message?

const getValidationSchema: GetValidationSchema<TextFieldComponentSchema> = componentDefinition => {
  const {key, validate = {}} = componentDefinition;
  const {required, maxLength, pattern} = validate;

  let schema: z.ZodString | z.ZodOptional<z.ZodString> = z.string();
  if (maxLength !== undefined) schema = schema.max(maxLength);

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
    schema = schema.optional();
  }

  return {[key]: schema};
};

export default getValidationSchema;
