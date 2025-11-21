import type {CosignV2ComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const getValidationSchema: GetValidationSchema<CosignV2ComponentSchema> = (
  componentDefinition,
  {validatePlugins}
) => {
  const {key, validate = {}, errors} = componentDefinition;
  const {required, plugins = []} = validate;

  let schema: z.ZodFirstPartySchemaTypes = z.string({required_error: errors?.required});

  if (required) {
    schema = schema.min(1).email();
  } else {
    schema = z.string().email().optional().or(z.literal(''));
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

  return {[key]: schema};
};

export default getValidationSchema;
