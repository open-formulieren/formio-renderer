import type {AnyComponentSchema} from '@open-formulieren/types';

import {FormSettingsContext} from '@/context';
import type {FormSettings} from '@/context';

export interface FormSettingsProviderProps {
  /**
   * Mark required fields with an asterisk. If asterisks are not used, then a suffix
   * is added to the label of optional fields to specify the field is not required.
   */
  requiredFieldsWithAsterisk?: boolean;
  components: AnyComponentSchema[];
  componentParameters?: FormSettings['componentParameters'];
  children?: React.ReactNode;
}

const FormSettingsProvider: React.FC<FormSettingsProviderProps> = ({
  requiredFieldsWithAsterisk,
  components,
  componentParameters,
  children,
}) => (
  <FormSettingsContext.Provider
    value={{requiredFieldsWithAsterisk, components, componentParameters}}
  >
    {children}
  </FormSettingsContext.Provider>
);

export default FormSettingsProvider;
