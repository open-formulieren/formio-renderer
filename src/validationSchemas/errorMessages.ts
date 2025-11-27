import {defineMessage} from 'react-intl';
import type {IntlShape} from 'react-intl';

const REQUIRED_MESSAGE = defineMessage({
  description: `Validation error for required field.`,
  defaultMessage: `The required field {fieldLabel} must be filled in.`,
});

type RequiredMessageValues = {
  fieldLabel: string;
};

/**
 * Helper function to construct the 'field required' validation message with
 * type-checked interpolation variables.
 */
export const buildRequiredMessage = (intl: IntlShape, values: RequiredMessageValues) =>
  intl.formatMessage(REQUIRED_MESSAGE, values);
