import type {AnyComponentSchema} from '@open-formulieren/types';

import {FormSettingsContext} from '@/context';
import type {FormSettings} from '@/context';
import {fallbackValidatePlugin} from '@/validationSchema';

export interface FormSettingsProviderProps {
  /**
   * Mark required fields with an asterisk. If asterisks are not used, then a suffix
   * is added to the label of optional fields to specify the field is not required.
   */
  requiredFieldsWithAsterisk?: boolean;
  components: AnyComponentSchema[];
  emailVerificationParameters?: FormSettings['emailVerificationParameters'];
  componentParameters?: FormSettings['componentParameters'];
  validatePluginCallback?: FormSettings['validatePluginCallback'];
  children?: React.ReactNode;
}

const FormSettingsProvider: React.FC<FormSettingsProviderProps> = ({
  requiredFieldsWithAsterisk,
  components,
  emailVerificationParameters,
  componentParameters,
  validatePluginCallback = fallbackValidatePlugin,
  children,
}) => (
  <FormSettingsContext.Provider
    value={{
      requiredFieldsWithAsterisk,
      components,
      emailVerificationParameters,
      componentParameters,
      validatePluginCallback,
    }}
  >
    {children}
  </FormSettingsContext.Provider>
);

export default FormSettingsProvider;
