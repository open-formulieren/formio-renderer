import {useContext} from 'react';

import {RendererSettingsContext} from './context';

export const useRendererSettings = () => useContext(RendererSettingsContext);
