import React from 'react';

export interface RendererSettings {
  /**
   * Mark required fields with an asterisk. If asterisks are not used, then a suffix
   * is added to the label of optional fields to specify the field is not required.
   */
  requiredFieldsWithAsterisk?: boolean;
}

const RendererSettingsContext = React.createContext<RendererSettings>({
  requiredFieldsWithAsterisk: true, // backwards compatible default
});

RendererSettingsContext.displayName = 'RendererSettingsContext';

export {RendererSettingsContext};
