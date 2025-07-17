import {FormSettingsContext} from '@/context';

export interface FormSettingsProviderProps {
  /**
   * Mark required fields with an asterisk. If asterisks are not used, then a suffix
   * is added to the label of optional fields to specify the field is not required.
   */
  requiredFieldsWithAsterisk?: boolean;
  children?: React.ReactNode;
}

const FormSettingsProvider: React.FC<FormSettingsProviderProps> = ({
  requiredFieldsWithAsterisk,
  children,
}) => (
  <FormSettingsContext.Provider value={{requiredFieldsWithAsterisk}}>
    {children}
  </FormSettingsContext.Provider>
);

export default FormSettingsProvider;
