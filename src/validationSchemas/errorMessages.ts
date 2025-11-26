import {defineMessage} from 'react-intl';

export const errorMessages: Record<string, ReturnType<typeof defineMessage>> = {
  required: defineMessage({
    description: `Validation error for required {field} field.`,
    defaultMessage: `The required field {fieldLabel} must be filled in.`,
  }),
};

export function getErrorMessage(errorType: string) {
  return errorMessages[errorType];
}
