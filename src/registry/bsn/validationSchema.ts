import type {BsnComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildBsnValidationSchema} from '@/validationSchemas/bsn';

const getValidationSchema: GetValidationSchema<BsnComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, multiple, validate = {}} = componentDefinition;
  const {required, plugins = []} = validate;

  // TODO: localize!
  let schema: z.ZodFirstPartySchemaTypes = buildBsnValidationSchema(intl);
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
      schema = schema.min(1);
    }
  }

  return {[key]: schema};
};

export default getValidationSchema;
