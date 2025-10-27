import type {TextFieldComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const getValidationSchema: GetValidationSchema<TextFieldComponentSchema> = (
  componentDefinition,
  {validatePlugins}
) => {
  const {key, validate = {}, multiple} = componentDefinition;
  const {required, maxLength, pattern, plugins = []} = validate;

  let schema: z.ZodFirstPartySchemaTypes = z.string();
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

  if (plugins.length) {
    schema = schema.superRefine(async (val, ctx) => {
      const message = await validatePlugins(plugins, val);
      if (!message) return;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: message,
      });
    });
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
