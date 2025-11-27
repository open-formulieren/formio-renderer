import type {CosignV2ComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildRequiredMessage} from '@/validationSchemas/errorMessages';

const getValidationSchema: GetValidationSchema<CosignV2ComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, errors, label} = componentDefinition;
  const {required, plugins = []} = validate;

  let baseSchema: z.ZodFirstPartySchemaTypes = z
    .string({
      required_error: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
    })
    .email();

  if (!required) {
    baseSchema = z.optional(baseSchema);
  }

  // normalize empty-ish values like `null`, `undefined`, `''`` to undefined
  let schema: z.ZodFirstPartySchemaTypes = z.preprocess(
    val => (val === '' ? undefined : val),
    baseSchema
  );

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
