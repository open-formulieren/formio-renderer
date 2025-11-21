import type {SignatureComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const SIGNATURE_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for signature',
  defaultMessage: 'The signature value must be a base64-encoded png.',
});

const isValidImage = (value: string): boolean => {
  return value.startsWith('data:image/png;base64,');
};

const getValidationSchema: GetValidationSchema<SignatureComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, errors} = componentDefinition;
  const {required, plugins = []} = validate;

  let schema: z.ZodFirstPartySchemaTypes = z
    .string({required_error: errors?.required})
    .refine(isValidImage, {message: intl.formatMessage(SIGNATURE_INVALID_MESSAGE)});
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

  return {[key]: schema};
};

export default getValidationSchema;
