import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import type {IntlShape} from 'react-intl';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const EMAIL_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for customerProfile.email that does not match the email format',
  defaultMessage:
    "Invalid email address - a valid email address looks something like 'willem@example.com'.",
});

const EMAIL_ONE_TIME_USE_AND_AS_PREFERRED_MESSAGE = defineMessage({
  description:
    'Validation error for customerProfile.email.useOnlyOnce and customerProfile.email.isNewPreferred that are both true',
  defaultMessage: "The email address cannot be marked as both 'one-time use' and 'preferred'.",
});

const PHONE_NUMBER_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for phone number format',
  defaultMessage:
    'Invalid phone number - a phone number may only contain digits, the + or - sign or spaces.',
});

const PHONE_NUMBER_ONE_TIME_USE_AND_AS_PREFERRED_MESSAGE = defineMessage({
  description:
    'Validation error for customerProfile.phoneNumber.useOnlyOnce and customerProfile.phoneNumber.isNewPreferred that are both true',
  defaultMessage: 'The phone number cannot be marked as both ‘one-time use’ and ‘preferred’.',
});

const buildEmailValidationSchema = (intl: IntlShape, isRequired: boolean) => {
  let emailSchema: z.ZodFirstPartySchemaTypes = z
    .strictObject({
      address: z.string().email({message: intl.formatMessage(EMAIL_INVALID_MESSAGE)}),
      useOnlyOnce: z.boolean().optional(),
      isNewPreferred: z.boolean().optional(),
    })
    .superRefine((value, ctx) => {
      const {useOnlyOnce, isNewPreferred} = value;
      // Sanity check - This should never happen, but just in case
      if (useOnlyOnce && isNewPreferred) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: intl.formatMessage(EMAIL_ONE_TIME_USE_AND_AS_PREFERRED_MESSAGE),
        });
      }
    });

  if (!isRequired) {
    emailSchema = emailSchema.optional();
  }

  return emailSchema;
};

const buildPhoneNumberValidationSchema = (intl: IntlShape, isRequired: boolean) => {
  let phoneNumberSchema: z.ZodFirstPartySchemaTypes = z
    .strictObject({
      address: z
        .string()
        .regex(/^[+0-9][- 0-9]+$/, {message: intl.formatMessage(PHONE_NUMBER_INVALID_MESSAGE)}),
      useOnlyOnce: z.boolean().optional(),
      isNewPreferred: z.boolean().optional(),
    })
    .superRefine((value, ctx) => {
      const {useOnlyOnce, isNewPreferred} = value;
      // Sanity check - This should never happen, but just in case
      if (useOnlyOnce && isNewPreferred) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: intl.formatMessage(PHONE_NUMBER_ONE_TIME_USE_AND_AS_PREFERRED_MESSAGE),
        });
      }
    });

  if (!isRequired) {
    phoneNumberSchema = phoneNumberSchema.optional();
  }

  return phoneNumberSchema;
};

const getValidationSchema: GetValidationSchema<CustomerProfileComponentSchema> = (
  componentDefinition,
  {intl}
) => {
  const {key, digitalAddressTypes, validate = {}} = componentDefinition;
  const {required = false} = validate;

  const emailSchema = buildEmailValidationSchema(intl, required);
  const phoneNumberSchema = buildPhoneNumberValidationSchema(intl, required);

  // The schema should not allow digital address data of digital address types that are
  // not selected.
  let schema: z.ZodFirstPartySchemaTypes = z.strictObject({
    ...(digitalAddressTypes.email ? {email: emailSchema} : undefined),
    ...(digitalAddressTypes.phoneNumber ? {phoneNumber: phoneNumberSchema} : undefined),
  });
  if (!required) {
    schema = schema.optional();
  }

  return {[key]: schema};
};

export default getValidationSchema;
