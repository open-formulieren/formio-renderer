import type {
  CustomerProfileComponentSchema,
  DigitalAddress,
  DigitalAddressType,
} from '@open-formulieren/types';
import type {IntlShape} from 'react-intl';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const USE_ONLY_ONCE_AND_AS_PREFERRED_CONSTRAINT_MESSAGE = defineMessage({
  description:
    'Validation error for customerProfile digital address useOnlyOnce and isNewPreferred that are both true',
  defaultMessage: "The digital address cannot be marked as both 'one-time use' and 'preferred'.",
});

const DUPLICATE_DIGITAL_ADDRESS_TYPES_MESSAGE = defineMessage({
  description:
    'Validation error for customerProfile with multiple digital addresses for the same type',
  defaultMessage: 'You cannot submit multiple digital addresses for the type {digitalAddressType}.',
});

const EMAIL_INVALID_MESSAGE = defineMessage({
  description:
    'Validation error for customerProfile digital address that does not match the email format',
  defaultMessage: 'Invalid email address.',
});

const PHONE_NUMBER_INVALID_MESSAGE = defineMessage({
  description:
    'Validation error for customerProfile digital address that does not match the phone number format',
  defaultMessage: 'Invalid phone number.',
});

/**
 * Builds a digital address validation schema for a specific digital address `type` and
 * `address` schema.
 *
 * This is a helper function used by the digital address type-specific builder functions.
 * Using the provided `basicAddressSchema`, this function builds a validation schema for
 * the specified `type`. This is not intended to be used directly by the
 * getValidationSchema or customerProfile component registry.
 *
 * The generic rules for digital addresses are defined in this builder. These include:
 * - The `type` field must be one of the allowed types for the digital address.
 * - The `address` is optional or required based on the component `required` parameter.
 *
 * @param required - `required` parameter from the parent component.
 * @param type - For which type of digital address the schema is meant.
 * @param addressSchema - The validation schema for the address field.
 */
const buildDigitalAddressSchema = (
  required: boolean,
  type: DigitalAddressType,
  addressSchema: z.ZodString
): z.ZodDiscriminatedUnionOption<'type'> => {
  let schema: z.ZodFirstPartySchemaTypes = addressSchema;
  if (required) {
    schema = schema.min(1);
  } else {
    schema = schema.or(z.literal('')).optional();
  }

  return z.strictObject({
    type: z.literal(type),
    address: schema,
    useOnlyOnce: z.boolean().optional(),
    isNewPreferred: z.boolean().optional(),
  });
};

type DigitalAddressSchemaBuilder = (
  intl: IntlShape,
  required: boolean
) => z.ZodDiscriminatedUnionOption<'type'>;

/**
 * Build a validation schema for a digital address of type `email`.
 */
const buildEmailDigitalAddressSchema: DigitalAddressSchemaBuilder = (intl, required) => {
  const addressSchema = z.string().email({message: intl.formatMessage(EMAIL_INVALID_MESSAGE)});
  return buildDigitalAddressSchema(required, 'email', addressSchema);
};

/**
 * Build a validation schema for a digital address of type `phoneNumber`.
 */
const buildPhoneNumberDigitalAddressSchema: DigitalAddressSchemaBuilder = (intl, required) => {
  const addressSchema = z
    .string()
    .regex(/^[+0-9][- 0-9]+$/, {message: intl.formatMessage(PHONE_NUMBER_INVALID_MESSAGE)});
  return buildDigitalAddressSchema(required, 'phoneNumber', addressSchema);
};

const digitalAddressTypeToSchemaBuilder: Record<DigitalAddressType, DigitalAddressSchemaBuilder> = {
  email: buildEmailDigitalAddressSchema,
  phoneNumber: buildPhoneNumberDigitalAddressSchema,
};

const getValidationSchema: GetValidationSchema<CustomerProfileComponentSchema> = (
  componentDefinition,
  {intl}
) => {
  const {key, digitalAddressTypes, validate = {}} = componentDefinition;
  const {required = false} = validate;

  // Zod discriminated union schema from a dynamic list of schemas has some issues.
  // Using type casting, we can get around the issue - https://github.com/colinhacks/zod/issues/1181.
  const digitalAddressSchemas = digitalAddressTypes.map(digitalAddressType => {
    const schemaBuilder = digitalAddressTypeToSchemaBuilder[digitalAddressType];
    return schemaBuilder(intl, required);
  }) as [z.ZodDiscriminatedUnionOption<'type'>];

  let schema: z.ZodFirstPartySchemaTypes = z.array(
    z.discriminatedUnion('type', digitalAddressSchemas)
  );

  if (required) {
    // When required, a value for each digital address type must be provided
    schema = schema.length(digitalAddressTypes.length);
  } else {
    schema = schema.optional();
  }

  // We have to do the superRefine on the top-level instead of on the individual schemas.
  // The discriminated union schema does not allow ZodEffects, only ZodObjects, so the
  // individual digital address schemas must be plain ZodObjects.
  schema = schema.superRefine((items: DigitalAddress[] | null, ctx) => {
    if (items == null) return;

    // Enforce the useOnlyOnce OR isNewPreferred constraint
    items.forEach((item, index) => {
      const {useOnlyOnce, isNewPreferred} = item;
      if (useOnlyOnce && isNewPreferred) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: intl.formatMessage(USE_ONLY_ONCE_AND_AS_PREFERRED_CONSTRAINT_MESSAGE),
          path: [index],
        });
      }
    });

    // Check that each digital address type is used once
    const duplicateAddressTypes = items.reduce<DigitalAddressType[]>((carry, address, index) => {
      // The current type is already in the list, so we don't need to add it again
      if (carry.includes(address.type)) {
        return carry;
      }

      if (items.findIndex(a => a.type === address.type) !== index) {
        carry.push(address.type);
      }
      return carry;
    }, []);

    if (duplicateAddressTypes.length) {
      duplicateAddressTypes.forEach(digitalAddressType => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: intl.formatMessage(DUPLICATE_DIGITAL_ADDRESS_TYPES_MESSAGE, {
            digitalAddressType,
          }),
        });
      });
    }
  });

  return {[key]: schema};
};

export default getValidationSchema;
