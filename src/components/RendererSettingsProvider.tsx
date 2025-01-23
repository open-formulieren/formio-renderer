import {RendererSettingsContext} from '@/context';

export interface RendererSettingsProviderProps {
  /**
   * Mark required fields with an asterisk. If asterisks are not used, then a suffix
   * is added to the label of optional fields to specify the field is not required.
   */
  requiredFieldsWithAsterisk?: boolean;
  children?: React.ReactNode;
}

const RendererSettingsProvider: React.FC<RendererSettingsProviderProps> = ({
  requiredFieldsWithAsterisk,
  children,
}) => (
  <RendererSettingsContext.Provider value={{requiredFieldsWithAsterisk}}>
    {children}
  </RendererSettingsContext.Provider>
);

export default RendererSettingsProvider;
