import type {IntlShape} from 'react-intl';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import {buildRequiredMessage} from './errorMessages';

const INVALID_EMAIL_ADDRESS_MESSAGE = defineMessage({
  description: 'Validation error for invalid email.',
  defaultMessage: 'Invalid email address.',
});

/**
 * Build a zod schema for email fields and centralize the validation error message
 * definitions.
 */
export const buildEmailValidationSchema = (
  intl: IntlShape,
  label: string,
  customRequiredMessage: string | undefined = undefined
): z.ZodString =>
  z
    .string({
      required_error: customRequiredMessage || buildRequiredMessage(intl, {fieldLabel: label}),
    })
    .email({message: intl.formatMessage(INVALID_EMAIL_ADDRESS_MESSAGE)});
