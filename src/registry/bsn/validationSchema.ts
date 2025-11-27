import type {BsnComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildBsnValidationSchema} from '@/validationSchemas/bsn';

const getValidationSchema: GetValidationSchema<BsnComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, multiple, validate = {}, errors, label} = componentDefinition;
  const {required, plugins = []} = validate;

  let schema: z.ZodFirstPartySchemaTypes = buildBsnValidationSchema(intl, label, errors?.required);
  if (!required) {
    schema = schema.or(z.literal('')).optional();
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
