import {AnyComponentSchema} from '@open-formulieren/types';

import {
  FormioComponentRenderer,
  RenderContent,
  RenderDate,
  RenderEmail,
  RenderNumber,
  RenderTextField,
} from '@/components/formio';

export type Registry = {
  [S in AnyComponentSchema as S['type']]: FormioComponentRenderer<S>;
};

const REGISTRY: Registry = {
  textfield: RenderTextField,
  // XXX: implement these for real
  email: RenderEmail,
  number: RenderNumber,
  date: RenderDate,
  content: RenderContent,
};

export default REGISTRY;
export {REGISTRY};
