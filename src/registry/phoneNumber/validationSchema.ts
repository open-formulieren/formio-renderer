import type {PhoneNumberComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildRequiredMessage} from '@/validationSchemas/errorMessages';
import {buildPhoneNumberValidationSchema} from '@/validationSchemas/phoneNumber';

const getValidationSchema: GetValidationSchema<PhoneNumberComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, multiple, errors, label} = componentDefinition;
  const {required, pattern, plugins = []} = validate;

  // base phone number shape - a more narrow pattern can be specified in the form builder
  let schema: z.ZodFirstPartySchemaTypes = buildPhoneNumberValidationSchema(
    intl,
    label,
    pattern,
    errors?.required,
    errors?.pattern
  );

  if (required) {
    schema = schema.min(1, {
      message: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
    });
  } else {
    schema = schema.optional().or(z.literal(''));
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
