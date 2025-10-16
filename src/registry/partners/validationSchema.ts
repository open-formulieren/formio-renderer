import type {PartnersComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import {
  PARTNER_AFFIXES_COMPONENT,
  PARTNER_BSN_COMPONENT,
  PARTNER_DATE_OF_BIRTH_COMPONENT,
  PARTNER_INITIALS_COMPONENT,
  PARTNER_LAST_NAME_COMPONENT,
} from '@/components/forms/Partners/subFieldDefinitions';
import getBSNValidationSchema from '@/registry/bsn/validationSchema';
import getDateValidationSchema from '@/registry/date/validationSchema';
import getTextfieldValidationSchema from '@/registry/textfield/validationSchema';
import type {GetValidationSchema} from '@/registry/types';

/**
 * Partners component validation schema for validating partner component values.
 *
 * The partner component has some edge-cases that should be impossible, and therefore are
 * not covered in this validation schema. This includes: adding multiple partners
 * manually, combining manual and server fetched partners, and having partners with the
 * same bsn number.
 */
const getValidationSchema: GetValidationSchema<PartnersComponentSchema> = (
  componentDefinition,
  intl,
  getRegistryEntry
) => {
  const {key} = componentDefinition;

  // Get schemas of partner fields
  const bsnSchema = getBSNValidationSchema(
    {
      ...PARTNER_BSN_COMPONENT,
      label: PARTNER_BSN_COMPONENT.label.defaultMessage,
    },
    intl,
    getRegistryEntry
  );

  const initialsSchema = getTextfieldValidationSchema(
    {
      ...PARTNER_INITIALS_COMPONENT,
      label: PARTNER_INITIALS_COMPONENT.label.defaultMessage,
    },
    intl,
    getRegistryEntry
  );

  const affixesSchema = getTextfieldValidationSchema(
    {
      ...PARTNER_AFFIXES_COMPONENT,
      label: PARTNER_AFFIXES_COMPONENT.label.defaultMessage,
    },
    intl,
    getRegistryEntry
  );

  const lastNameSchema = getTextfieldValidationSchema(
    {
      ...PARTNER_LAST_NAME_COMPONENT,
      label: PARTNER_LAST_NAME_COMPONENT.label.defaultMessage,
    },
    intl,
    getRegistryEntry
  );

  const dateOfBirthSchema = getDateValidationSchema(
    {
      ...PARTNER_DATE_OF_BIRTH_COMPONENT,
      label: PARTNER_DATE_OF_BIRTH_COMPONENT.label.defaultMessage,
    },
    intl,
    getRegistryEntry
  );

  // Define partners schema
  const partnersSchema = z.array(
    z.object({
      ...bsnSchema,
      ...initialsSchema,
      ...affixesSchema,
      ...lastNameSchema,
      ...dateOfBirthSchema,
      // __addedManually must either be true or undefined.
      __addedManually: z.literal<boolean>(true).optional(),
    })
  );

  return {[key]: partnersSchema};
};

export default getValidationSchema;
