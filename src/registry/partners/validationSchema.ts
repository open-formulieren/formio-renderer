import type {PartnersComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import {
  PARTNER_AFFIXES_FIELD,
  PARTNER_BSN_FIELD,
  PARTNER_DATE_OF_BIRTH_FIELD,
  PARTNER_INITIALS_FIELD,
  PARTNER_LAST_NAME_FIELD,
} from '@/components/forms/Partners/definition';
import getBSNValidationSchema from '@/registry/bsn/validationSchema';
import getDateValidationSchema from '@/registry/date/validationSchema';
import getTextfieldValidationSchema from '@/registry/textfield/validationSchema';
import type {GetValidationSchema} from '@/registry/types';

const getValidationSchema: GetValidationSchema<PartnersComponentSchema> = (
  componentDefinition,
  intl,
  getRegistryEntry
) => {
  const {key} = componentDefinition;

  // Get schemas of partner fields
  const bsnSchema = getBSNValidationSchema(
    {
      ...PARTNER_BSN_FIELD,
      label: PARTNER_BSN_FIELD.label.defaultMessage,
    },
    intl,
    getRegistryEntry
  );

  const initialsSchema = getTextfieldValidationSchema(
    {
      ...PARTNER_INITIALS_FIELD,
      label: PARTNER_INITIALS_FIELD.label.defaultMessage,
    },
    intl,
    getRegistryEntry
  );

  const affixesSchema = getTextfieldValidationSchema(
    {
      ...PARTNER_AFFIXES_FIELD,
      label: PARTNER_AFFIXES_FIELD.label.defaultMessage,
    },
    intl,
    getRegistryEntry
  );

  const lastNameSchema = getTextfieldValidationSchema(
    {
      ...PARTNER_LAST_NAME_FIELD,
      label: PARTNER_LAST_NAME_FIELD.label.defaultMessage,
    },
    intl,
    getRegistryEntry
  );

  const dateOfBirthSchema = getDateValidationSchema(
    {
      ...PARTNER_DATE_OF_BIRTH_FIELD,
      label: PARTNER_DATE_OF_BIRTH_FIELD.label.defaultMessage,
    },
    intl,
    getRegistryEntry
  );

  // Define partners schema
  const partnersSchema = z.array(
    z.strictObject({
      ...bsnSchema,
      ...initialsSchema,
      ...affixesSchema,
      ...lastNameSchema,
      ...dateOfBirthSchema,
    })
  );

  return {[key]: partnersSchema};
};

export default getValidationSchema;
