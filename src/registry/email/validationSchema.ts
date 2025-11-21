import type {EmailComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const getValidationSchema: GetValidationSchema<EmailComponentSchema> = (
  componentDefinition,
  {validatePlugins}
) => {
  const {key, validate = {}, multiple, errors} = componentDefinition;
  const {required, plugins = []} = validate;

  let schema: z.ZodFirstPartySchemaTypes = z.string({required_error: errors?.required});

  if (required) {
    schema = schema.min(1).email();
  } else {
    schema = z.string().email().or(z.literal('')).optional();
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
      schema = schema.min(1, {message: errors?.required});
    }
  }

  return {[key]: schema};
};

export default getValidationSchema;
