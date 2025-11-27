import type {EmailComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildRequiredMessage} from '@/validationSchemas/errorMessages';

const INVALID_EMAIL_ADDRESS_MESSAGE = defineMessage({
  description: 'Validation error for invalid email.',
  defaultMessage: 'Invalid email address.',
});

const getValidationSchema: GetValidationSchema<EmailComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, multiple, errors, label} = componentDefinition;
  const {required, plugins = []} = validate;

  let baseSchema: z.ZodFirstPartySchemaTypes = z
    .string({
      required_error: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
    })
    .email({message: intl.formatMessage(INVALID_EMAIL_ADDRESS_MESSAGE)});
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

  if (multiple) {
    schema = z.array(schema);
    if (required) {
      schema = schema.min(1, {
        message: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
      });
    }
  }

  return {[key]: schema};
};

export default getValidationSchema;
