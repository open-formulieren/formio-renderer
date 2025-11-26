import type {PhoneNumberComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {getErrorMessage} from '@/validationSchemas/errorMessages';

const PHONE_NUMBER_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for phone number format.',
  defaultMessage:
    'Invalid phone number - a phone number may only contain digits, the + or - sign or spaces',
});

const getValidationSchema: GetValidationSchema<PhoneNumberComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, multiple, errors, label} = componentDefinition;
  const {required, pattern, plugins = []} = validate;

  // base phone number shape - a more narrow pattern can be specified in the form builder
  let schema: z.ZodFirstPartySchemaTypes = z
    .string({
      required_error:
        errors?.required ||
        intl.formatMessage(getErrorMessage('required'), {field: 'Phonenumber', fieldLabel: label}),
    })
    .regex(/^[+0-9][- 0-9]+$/, {
      message: intl.formatMessage(PHONE_NUMBER_INVALID_MESSAGE),
    });

  if (pattern) {
    let normalizedPattern = pattern;
    // Formio implicitly adds the ^ and $ markers to consider the whole value
    if (!normalizedPattern.startsWith('^')) normalizedPattern = `^${normalizedPattern}`;
    if (!normalizedPattern.endsWith('$')) normalizedPattern = `${normalizedPattern}$`;
    schema = schema.regex(new RegExp(normalizedPattern), {message: errors?.pattern});
  }

  if (required) {
    schema = schema.min(1, {
      message:
        errors?.required ||
        intl.formatMessage(getErrorMessage('required'), {field: 'Phonenumber', fieldLabel: label}),
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
