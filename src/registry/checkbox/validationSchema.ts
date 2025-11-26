import type {CheckboxComponentSchema} from '@open-formulieren/types';
import {z} from 'zod';

import type {GetValidationSchema} from '@/registry/types';
import {getErrorMessage} from '@/validationSchemas/errorMessages';

const getValidationSchema: GetValidationSchema<CheckboxComponentSchema> = (
  componentDefinition,
  {intl, validatePlugins}
) => {
  const {key, validate = {}, errors, label} = componentDefinition;
  const {required, plugins = []} = validate;

  const schema: z.ZodEffects<z.ZodBoolean> = z.boolean().superRefine(async (val, ctx) => {
    if (required && !val) {
      // see open-forms-sdk `src/hooks/useZodErrorMap.jsx`
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        // a lie, but required for the error map hook
        received: z.ZodParsedType.undefined,
        expected: z.ZodParsedType.boolean,
        message:
          errors?.required ||
          intl.formatMessage(getErrorMessage('required'), {
            field: 'Checkbox',
            fieldLabel: label,
          }),
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

  return {[key]: schema};
};

export default getValidationSchema;
