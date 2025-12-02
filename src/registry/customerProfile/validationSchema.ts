import type {
  CustomerProfileComponentSchema,
  DigitalAddress,
  DigitalAddressType,
} from '@open-formulieren/types';
import type {IntlShape} from 'react-intl';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {buildEmailValidationSchema} from '@/validationSchemas/email';
import {buildPhoneNumberValidationSchema} from '@/validationSchemas/phoneNumber';

import {FIELD_LABELS} from './subFields';

const DUPLICATE_DIGITAL_ADDRESS_TYPES_MESSAGE = defineMessage({
  description:
    'Validation error for customerProfile with multiple digital addresses for the same type',
  defaultMessage: 'You cannot submit multiple digital addresses for the type {digitalAddressType}.',
});

const REQUIRED_PROFILE_MESSAGE = defineMessage({
  description: 'Validation error for required customerProfile without digital addresses',
  defaultMessage: 'At least one digital address should be provided.',
});

/**
 * An array with more than one element.
 */
export type MultipleElementsArray<T> = [T, T, ...T[]];

export function assertMultipleElementsArray<T>(arr: T[]): asserts arr is MultipleElementsArray<T> {
  if (arr.length < 2) throw new Error('Instantiated with fewer than two items');
}

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
 * @param isRequired - `required` parameter from the parent component.
 * @param type - For which type of digital address the schema is meant.
 * @param addressSchema - The validation schema for the address field.
 */
const buildDigitalAddressSchema = (
  isRequired: boolean,
  type: DigitalAddressType,
  addressSchema: z.ZodString
): z.ZodDiscriminatedUnionOption<'type'> => {
  let schema: z.ZodFirstPartySchemaTypes = addressSchema;
  if (!isRequired) {
    schema = z.optional(schema);
  }

  // normalize empty-ish values like `null`, `undefined`, `''`` to undefined
  schema = z.preprocess(val => (val === '' ? undefined : val), schema);

  return z.strictObject({
    type: z.literal(type),
    address: schema,
    preferenceUpdate: z.enum(['useOnlyOnce', 'isNewPreferred']).optional(),
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
  return buildDigitalAddressSchema(
    required,
    'email',
    buildEmailValidationSchema(intl, intl.formatMessage(FIELD_LABELS.email))
  );
};

/**
 * Build a validation schema for a digital address of type `phoneNumber`.
 */
const buildPhoneNumberDigitalAddressSchema: DigitalAddressSchemaBuilder = (intl, required) =>
  buildDigitalAddressSchema(
    required,
    'phoneNumber',
    buildPhoneNumberValidationSchema(intl, intl.formatMessage(FIELD_LABELS.phoneNumber))
  );

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

  // The subfields are required when the component is required and only one digital
  // address type is allowed.
  const requiredSubfields = required && digitalAddressTypes.length === 1;

  const digitalAddressSchemas = digitalAddressTypes.map(digitalAddressType => {
    const schemaBuilder = digitalAddressTypeToSchemaBuilder[digitalAddressType];
    return schemaBuilder(intl, requiredSubfields);
  });

  let schema: z.ZodFirstPartySchemaTypes;
  if (digitalAddressSchemas.length === 1) {
    // If there's only one digital address type, we can tell Zod that every item must
    // follow that schema.
    schema = z.array(digitalAddressSchemas[0]);
  } else {
    // If there are multiple digital address types, then Zod needs to understand that
    // every item must conform to the schema of its type.
    // (email conforms the email schema, phone conforms the phoneNumber schema, etc.)
    assertMultipleElementsArray(digitalAddressSchemas);
    schema = z.array(z.discriminatedUnion('type', digitalAddressSchemas));
  }

  // We have to do the superRefine on the top-level instead of on the individual schemas.
  // The discriminated union schema does not allow ZodEffects, only ZodObjects, so the
  // individual digital address schemas must be plain ZodObjects.
  schema = schema.superRefine((items: DigitalAddress[], ctx) => {
    // When required, at least one digital address must be provided.
    const hasAtLeastOneDigitalAddress = items.some(item => !!item.address);
    if (required && !hasAtLeastOneDigitalAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: intl.formatMessage(REQUIRED_PROFILE_MESSAGE),
      });
    }

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
