import type {TextareaComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildRequiredMessage} from '@/validationSchemas/errorMessages';

const TEXTAREA_MAX_LENGTH_MESSAGE = defineMessage({
  description: 'Validation error for Textarea that exceeds max length.',
  defaultMessage: 'There are too many characters provided.',
});

const TEXTAREA_WRONG_PATTERN_MESSAGE = defineMessage({
  description: 'Validation error for Textarea that does not match the pattern.',
  defaultMessage: 'The submitted value does not match the pattern: {pattern}.',
});

const getValidationSchema: GetValidationSchema<TextareaComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, multiple, errors, label} = componentDefinition;
  const {required, maxLength, pattern, plugins = []} = validate;

  let schema: z.ZodFirstPartySchemaTypes = z.string({
    required_error: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
  });

  if (maxLength !== undefined)
    schema = schema.max(maxLength, {
      message: errors?.maxLength || intl.formatMessage(TEXTAREA_MAX_LENGTH_MESSAGE),
    });

  if (pattern) {
    let normalizedPattern = pattern;
    // Formio implicitly adds the ^ and $ markers to consider the whole value
    if (!normalizedPattern.startsWith('^')) normalizedPattern = `^${normalizedPattern}`;
    if (!normalizedPattern.endsWith('$')) normalizedPattern = `${normalizedPattern}$`;
    schema = schema.regex(new RegExp(normalizedPattern), {
      message: errors?.pattern || intl.formatMessage(TEXTAREA_WRONG_PATTERN_MESSAGE, {pattern}),
    });
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
      schema = schema.min(1, {
        message: errors?.required || buildRequiredMessage(intl, {fieldLabel: label}),
      });
    }
  }

  return {[key]: schema};
};

export default getValidationSchema;
