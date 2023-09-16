import React, {useContext} from 'react';

// CONFIGURATION CONTEXT

export interface ConfigurationContextType {
  asteriskForRequired: boolean;
}

const ConfigurationContext = React.createContext<ConfigurationContextType>({
  asteriskForRequired: true,
});

ConfigurationContext.displayName = 'ConfigurationContext';

const useConfigurationContext = () => {
  const config = useContext(ConfigurationContext);
  return config;
};

export {ConfigurationContext, useConfigurationContext};
