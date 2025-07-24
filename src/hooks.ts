import {useContext} from 'react';

import {FormSettingsContext} from './context';

export const useFormSettings = () => useContext(FormSettingsContext);
