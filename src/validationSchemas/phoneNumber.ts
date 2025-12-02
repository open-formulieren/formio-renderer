import type {IntlShape} from 'react-intl';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import {buildRequiredMessage} from '@/validationSchemas/errorMessages';

const INVALID_PHONE_NUMBER_MESSAGE = defineMessage({
  description: 'Validation error for invalid phone number.',
  defaultMessage:
    'Invalid phone number - a phone number may only contain digits, the + or - sign or spaces.',
});

/**
 * Build a zod schema for phone number fields and centralize the validation error message
 * definitions.
 */
export const buildPhoneNumberValidationSchema = (
  intl: IntlShape,
  label: string,
  pattern: string | undefined = undefined,
  customRequiredMessage: string | undefined = undefined,
  customPatternMessage: string | undefined = undefined
): z.ZodString => {
  let schema = z
    .string({
      required_error: customRequiredMessage || buildRequiredMessage(intl, {fieldLabel: label}),
    })
    .regex(/^[+0-9][- 0-9]+$/, {
      message: intl.formatMessage(INVALID_PHONE_NUMBER_MESSAGE),
    });

  if (pattern) {
    let normalizedPattern = pattern;
    // Formio implicitly adds the ^ and $ markers to consider the whole value
    if (!normalizedPattern.startsWith('^')) normalizedPattern = `^${normalizedPattern}`;
    if (!normalizedPattern.endsWith('$')) normalizedPattern = `${normalizedPattern}$`;
    schema = schema.regex(new RegExp(normalizedPattern), {
      message: customPatternMessage || intl.formatMessage(INVALID_PHONE_NUMBER_MESSAGE),
    });
  }

  return schema;
};
