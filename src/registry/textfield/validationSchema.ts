import type {TextFieldComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildRequiredMessage} from '@/validationSchemas/errorMessages';

const TEXTFIELD_MAX_LENGTH_MESSAGE = defineMessage({
  description: 'Validation error for TEXTFIELD that exceeds max length.',
  defaultMessage: 'There are too many characters provided.',
});

const TEXTFIELD_WRONG_PATTERN_MESSAGE = defineMessage({
  description: 'Validation error for TEXTFIELD that does not match the pattern.',
  defaultMessage: 'The submitted value does not match the pattern: {pattern}.',
});

const getValidationSchema: GetValidationSchema<TextFieldComponentSchema> = (
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
      message:
        errors?.maxLength || intl.formatMessage(TEXTFIELD_MAX_LENGTH_MESSAGE, {field: label}),
    });

  if (pattern) {
    let normalizedPattern = pattern;
    // Formio implicitly adds the ^ and $ markers to consider the whole value
    if (!normalizedPattern.startsWith('^')) normalizedPattern = `^${normalizedPattern}`;
    if (!normalizedPattern.endsWith('$')) normalizedPattern = `${normalizedPattern}$`;
    schema = schema.regex(new RegExp(normalizedPattern), {
      message:
        errors?.pattern || intl.formatMessage(TEXTFIELD_WRONG_PATTERN_MESSAGE, {pattern: pattern}),
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
      schema = schema.min(1, errors?.required || buildRequiredMessage(intl, {fieldLabel: label}));
    }
  }

  return {[key]: schema};
};

export default getValidationSchema;
