import type {AnyComponentSchema} from '@open-formulieren/types';
import {createContext} from 'react';

import type {JSONObject} from '@/types';

// set up a context to track the parent values when dealing with nested edit grids
interface ParentValuesContextType {
  keyPrefix: string; // component keys from root to leaf, to track position in nested edit grids
  values: JSONObject;
  componentsMap: Record<string, AnyComponentSchema>;
}

const ParentValuesContext = createContext<ParentValuesContextType>({
  keyPrefix: '',
  values: {},
  componentsMap: {},
});
ParentValuesContext.displayName = 'ParentValuesContext';

export default ParentValuesContext;
