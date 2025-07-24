import React from 'react';

export interface FormSettings {
  /**
   * Mark required fields with an asterisk. If asterisks are not used, then a suffix
   * is added to the label of optional fields to specify the field is not required.
   */
  requiredFieldsWithAsterisk?: boolean;
}

const FormSettingsContext = React.createContext<FormSettings>({
  requiredFieldsWithAsterisk: true, // backwards compatible default
});

FormSettingsContext.displayName = 'FormSettingsContext';

export {FormSettingsContext};
