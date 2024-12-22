import type {AnyComponentSchema} from '@open-formulieren/types';

import {FormioComponentProps} from '@/components/FormioComponent';

import Fieldset from './fieldset';
import TextField from './textfield';

export type Registry = {
  // TODO: drop the '?' once all component types are implemented
  [S in AnyComponentSchema as S['type']]?: React.FC<FormioComponentProps<S>>;
};

export const REGISTRY: Registry = {
  // basic
  textfield: TextField,
  // special types
  // layout
  fieldset: Fieldset,
  // deprecated
};
