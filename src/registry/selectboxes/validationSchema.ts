import type {SelectboxesComponentSchema} from '@open-formulieren/types';
import {defineMessage} from 'react-intl';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {getErrorMessage} from '@/validationSchemas/errorMessages';

import {assertManualValues} from './types';

const MIN_COUNT_MESSAGE = defineMessage({
  description: 'Selectboxes minimum selected count error message',
  defaultMessage: `You must select at least {minSelectedCount, plural,
    one {{minSelectedCount, number} item}
    other {{minSelectedCount, number} items}
  }.`,
});

const MAX_COUNT_MESSAGE = defineMessage({
  description: 'Selectboxes maximum selected count error message',
  defaultMessage: `You can only select up to {maxSelectedCount, plural,
    one {{maxSelectedCount, number} item}
    other {{maxSelectedCount, number} items}
  }.`,
});

type ValuesObject = z.ZodEffects<z.ZodObject<{[k: string]: z.ZodBoolean}>>;
type ValidationSchema = ValuesObject | z.ZodUnion<[z.ZodOptional<ValuesObject>, z.ZodNull]>;

const getValidationSchema: GetValidationSchema<SelectboxesComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  assertManualValues(componentDefinition);
  const {key, validate = {}, values: options, errors, label} = componentDefinition;
  const {required, minSelectedCount, maxSelectedCount, plugins = []} = validate;

  // all properties are required by default - this mirrors the explicit true/false
  // values for each checkbox in Formio
  let schema: ValidationSchema = z
    .object(Object.fromEntries(options.map(option => [option.value, z.boolean()])))
    .strict()
    // run additional validation based on the selected items
    .superRefine(async (val, ctx) => {
      const numChecked = Object.entries(val).filter(([, checked]) => checked).length;
      if (!required && numChecked === 0) return;

      // minSelectedCount has prio over required checks
      if (minSelectedCount !== undefined) {
        if (numChecked < minSelectedCount) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: minSelectedCount,
            type: 'set',
            inclusive: false,
            message:
              errors?.minSelectedCount || intl.formatMessage(MIN_COUNT_MESSAGE, {minSelectedCount}),
          });
        }
      } else if (required && numChecked < 1) {
        // see open-forms-sdk `src/hooks/useZodErrorMap.jsx`
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_type,
          received: z.ZodParsedType.undefined,
          expected: z.ZodParsedType.object,
          message:
            errors?.required ||
            intl.formatMessage(getErrorMessage('required'), {
              field: 'Selectboxes',
              fieldLabel: label,
            }),
        });
      }

      if (maxSelectedCount !== undefined && numChecked > maxSelectedCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: maxSelectedCount,
          type: 'set',
          inclusive: true,
          message:
            errors?.maxSelectedCount || intl.formatMessage(MAX_COUNT_MESSAGE, {maxSelectedCount}),
        });
      }

      if (plugins.length) {
        const message = await validatePlugins(plugins, val);
        if (message) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: message,
          });
        }
      }
    });

  // for optional fields, the backend accepts:
  // * missing key entirely (maps to undefined for us, so the '.optional()' case)
  // * `null` value for the component as a whole, rather than an object
  if (!required) {
    schema = z.union([schema.optional(), z.null()]);
  }

  return {[key]: schema};
};

export default getValidationSchema;
