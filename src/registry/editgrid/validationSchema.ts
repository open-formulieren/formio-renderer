import type {EditGridComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import {ITEM_EXPANDED_MARKER} from '@/components/forms/EditGrid/constants';
import type {MarkedEditGridItem} from '@/components/forms/EditGrid/types';
import type {GetValidationSchema} from '@/registry/types';
import type {JSONObject} from '@/types';
import {buildRequiredMessage} from '@/validationSchemas/errorMessages';

const EDIT_GRID_MAX_LENGTH_MESSAGE = defineMessage({
  description: 'Validation error for editgrid that exceeds max length.',
  defaultMessage: 'Ensure the number of items is less than or equal to {maxLength}.',
});

const getValidationSchema: GetValidationSchema<EditGridComponentSchema> = (
  componentDefinition,
  {intl}
) => {
  const {key, label, validate = {}} = componentDefinition;
  const {required, maxLength} = validate;

  let schema: z.ZodFirstPartySchemaTypes = z.array(
    // editgrid is always an array of objects. The object themselves are validated
    // when the item is saved (it's a nested Formik state with its own validation
    // schema).
    // TODO if we allow inline editing -> the full schema needs to be provided, and you
    // need to take into account the field visibility based on the data & clearOnHide
    // behaviour for each individual item, so that'll probably need to be done in a
    // `superRefine` call because not every item has the same schema!
    z.object({} satisfies MarkedEditGridItem<JSONObject>).passthrough()
  );
  if (required) {
    schema = schema.min(1, {message: buildRequiredMessage(intl, {fieldLabel: label})});
  }

  if (maxLength !== undefined) {
    schema = schema.max(maxLength, {
      message: intl.formatMessage(EDIT_GRID_MAX_LENGTH_MESSAGE, {maxLength}),
    });
  }

  schema = schema.superRefine((val, ctx) => {
    // .passthrough produces `any` type, .catchall doesn't provide a good escape hatch
    // either.
    const items: MarkedEditGridItem<JSONObject>[] = val;
    items.forEach((item, index) => {
      const isOpen = item[ITEM_EXPANDED_MARKER];
      if (isOpen) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: intl.formatMessage({
            description: "Validation error when the edit grid item is still in 'expanded' state.",
            defaultMessage: 'Save all rows before proceeding.',
          }),
          path: [index],
        });
      }
    });
  });

  return {[key]: schema};
};

export default getValidationSchema;
