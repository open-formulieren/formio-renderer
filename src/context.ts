import type {AnyComponentSchema} from '@open-formulieren/types';
import React from 'react';

import type {AddressNLParameters} from './registry/addressNL/types';
import type {MapParameters} from './registry/map/types';

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
    map?: MapParameters;
  };
}

const FormSettingsContext = React.createContext<FormSettings>({
  requiredFieldsWithAsterisk: true, // backwards compatible default
  components: [],
});

FormSettingsContext.displayName = 'FormSettingsContext';

export interface FieldConfig {
  /**
   * Optional prefix to add to the `name` attribute of a field, to ensure that scopes
   * don't clash in the browser (e.g. radio fields in repeating groups).
   */
  namePrefix: string | undefined;
}

/**
 * Context to tweak behaviour of individual form fields.
 */
const FieldConfigContext = React.createContext<FieldConfig>({namePrefix: ''});
FieldConfigContext.displayName = 'FieldConfigContext';

export {FormSettingsContext, FieldConfigContext};
