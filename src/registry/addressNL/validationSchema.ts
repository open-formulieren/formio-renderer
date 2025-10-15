import type {AddressNLComponentSchema, PostcodeComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import type {IntlShape} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';

const DEFAULT_POSTCODE_PATTERN: PostcodeComponentSchema['validate']['pattern'] =
  '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$';
export const DEFAULT_POSTCODE_REGEX = new RegExp(DEFAULT_POSTCODE_PATTERN, 'i'); // case insensitive

export const HOUSE_NUMBER_REGEX = /^\d{1,5}$/;

const POSTCODE_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for addressNL.postcode that does not match the postcode regex.',
  defaultMessage: 'Postcode must be four digits followed by two letters (e.g. 1234 AB).',
});

const HOUSE_NUMBER_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for addressNL.houseNumber field.',
  defaultMessage: 'House number must be a number with up to five digits (e.g. 456).',
});

const HOUSE_LETTER_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for addressNL.houseLetter field.',
  defaultMessage: 'House letter must be a single letter.',
});

const HOUSE_NUMBER_ADDITION_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for addressNL.houseNumberAddition field.',
  defaultMessage: 'House number addition must be up to four letters and digits.',
});

const STREET_NAME_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for required addressNL.streetName field.',
  defaultMessage: 'You must provide a street name.',
});

const CITY_INVALID_MESSAGE = defineMessage({
  description: 'Validation error for required addressNL.city field.',
  defaultMessage: 'You must provide a city.',
});

interface PostcodeOptions {
  pattern: string | undefined;
  message: string | undefined;
}

const buildPostcodeSchema = (
  intl: IntlShape,
  isRequired: boolean,
  {pattern, message}: PostcodeOptions
): z.ZodFirstPartySchemaTypes => {
  const defaultMessage = intl.formatMessage(POSTCODE_INVALID_MESSAGE);
  let postcodeSchema: z.ZodFirstPartySchemaTypes = z
    .string()
    .regex(DEFAULT_POSTCODE_REGEX, {message: defaultMessage});
  // add the custom pattern *on top of* the default pattern, which is always supposed to
  // be less strict than custom patterns
  if (pattern) {
    postcodeSchema = postcodeSchema.regex(new RegExp(pattern, 'i'), {
      message: message || defaultMessage,
    });
  }
  if (!isRequired) {
    postcodeSchema = postcodeSchema.optional();
  }
  return postcodeSchema;
};

const buildHouseNumberSchema = (
  intl: IntlShape,
  isRequired: boolean
): z.ZodFirstPartySchemaTypes => {
  let houseNumberSchema: z.ZodFirstPartySchemaTypes = z.string().regex(HOUSE_NUMBER_REGEX, {
    message: intl.formatMessage(HOUSE_NUMBER_INVALID_MESSAGE),
  });
  if (!isRequired) {
    houseNumberSchema = houseNumberSchema.optional();
  }
  return houseNumberSchema;
};

const buildStreetNameSchema = (
  intl: IntlShape,
  isRequired: boolean
): z.ZodFirstPartySchemaTypes => {
  let streetNameSchema: z.ZodFirstPartySchemaTypes = z.string();
  if (isRequired) {
    streetNameSchema = streetNameSchema.min(1, {
      message: intl.formatMessage(STREET_NAME_INVALID_MESSAGE),
    });
  } else {
    streetNameSchema = streetNameSchema.optional();
  }
  return streetNameSchema;
};

interface CityOptions {
  pattern: string | undefined;
  message: string | undefined;
}

const buildCitySchema = (
  intl: IntlShape,
  isRequired: boolean,
  {pattern, message}: CityOptions
): z.ZodFirstPartySchemaTypes => {
  const defaultMessage = intl.formatMessage(CITY_INVALID_MESSAGE);
  let citySchema: z.ZodFirstPartySchemaTypes = z.string();
  if (pattern) {
    citySchema = citySchema.regex(new RegExp(pattern), {message: message || defaultMessage});
  }
  if (isRequired) {
    citySchema = citySchema.min(1, {message: defaultMessage});
  } else {
    citySchema = citySchema.optional();
  }
  return citySchema;
};

/**
 * Build the (client-side) validation schema for the address NL data.
 *
 * Because this is a composite, the validation logic is a bit different from what we're
 * used to.
 *
 * A required addressNL component means that:
 *
 * - the postcode field is required
 * - the house number field is required
 *
 * since these are the minimal atoms that allow you to resolve an address.
 *
 * House letter and house number addition are always optional, because not every address
 * has those.
 *
 * When address derivation is enabled, the street name and city fields become visible
 * and they're either auto populated, or due to an error manually filled in by the user.
 * This makes the fields mandatory (!).
 *
 * Furthermore (this applies to optional address NL fields), you must either provide
 * both the postcode and houser number, or none at all, as partial data does not make
 * sense. Here too, if address derivation is enabled, filling out one field requires
 * that city and street name are populated too.
 */
const getValidationSchema: GetValidationSchema<AddressNLComponentSchema> = (
  componentDefinition,
  intl
) => {
  const {key, validate, deriveAddress = false, openForms} = componentDefinition;
  const required = Boolean(validate?.required);

  const customPostcodePattern = openForms?.components?.postcode?.validate?.pattern;
  const customPostcodeMessage = openForms?.components?.postcode?.errors?.pattern;
  const postcodeSchema = buildPostcodeSchema(intl, required, {
    pattern: customPostcodePattern,
    message: customPostcodeMessage,
  });

  const houseNumberSchema = buildHouseNumberSchema(intl, required);

  // if address derivation is enabled, street name and city are required
  const streetNameSchema = buildStreetNameSchema(intl, required && deriveAddress);

  const customCityPattern = openForms?.components?.city?.validate?.pattern;
  const customCityMessage = openForms?.components?.city?.errors?.pattern;
  const citySchema = buildCitySchema(intl, required && deriveAddress, {
    pattern: customCityPattern,
    message: customCityMessage,
  });

  const schema: z.ZodFirstPartySchemaTypes = z
    .object({
      postcode: postcodeSchema,
      houseNumber: houseNumberSchema,
      houseLetter: z
        .string()
        .regex(/^[a-zA-Z]$/, {message: intl.formatMessage(HOUSE_LETTER_INVALID_MESSAGE)})
        .optional(),
      houseNumberAddition: z
        .string()
        .regex(/^([a-zA-Z0-9]){1,4}$/, {
          message: intl.formatMessage(HOUSE_NUMBER_ADDITION_INVALID_MESSAGE),
        })
        .optional(),
      streetName: streetNameSchema,
      city: citySchema,
    })
    .superRefine((val, ctx) => {
      const postcodeOrHouseNumberProvided = Boolean(val.postcode || val.houseNumber);
      // if any field is provided in a non-required component, the other field(s) must also
      // be provided
      if (!required && postcodeOrHouseNumberProvided) {
        if (!val.houseNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: intl.formatMessage({
              description:
                'Validation error when AddressNL.postcode is provided but not houseNumber',
              defaultMessage: 'You must provide a house number.',
            }),
            path: ['houseNumber'],
          });
        }

        if (!val.postcode) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: intl.formatMessage({
              description:
                'Validation error when AddressNL.houseNumber is provided but not postcode',
              defaultMessage: 'You must provide a postcode.',
            }),
            path: ['postcode'],
          });
        }

        if (deriveAddress && !val.streetName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: intl.formatMessage(STREET_NAME_INVALID_MESSAGE),
            path: ['streetName'],
          });
        }

        if (deriveAddress && !val.city) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: intl.formatMessage(CITY_INVALID_MESSAGE),
            path: ['city'],
          });
        }
      }
    });

  return {[key]: schema};
};

export default getValidationSchema;
