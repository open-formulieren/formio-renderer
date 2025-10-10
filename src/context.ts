import type {AnyComponentSchema} from '@open-formulieren/types';
import React from 'react';

import type {AddressNLParameters} from './registry/addressNL/types';

export interface FormSettings {
  /**
   * Mark required fields with an asterisk. If asterisks are not used, then a suffix
   * is added to the label of optional fields to specify the field is not required.
   */
  requiredFieldsWithAsterisk?: boolean;
  /**
   * All the components that are used in the form.
   */
  components: AnyComponentSchema[];
  /**
   * Configuration necessary specific to certain Formio component types.
   */
  componentParameters?: {
    addressNL?: AddressNLParameters;
  };
}

const FormSettingsContext = React.createContext<FormSettings>({
  requiredFieldsWithAsterisk: true, // backwards compatible default
  components: [],
});

FormSettingsContext.displayName = 'FormSettingsContext';

export {FormSettingsContext};
