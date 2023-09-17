import {AnyComponentSchema} from '@open-formulieren/types';

import {FormioComponentRenderer} from '@/components/formio';
import {REGISTRY} from '@/components/registry';

export interface FormioComponentProps<T> {
  component: T;
}

/**
 * Render a single Form.io component from its configuration.
 *
 * If the component is a layout component, this will result in recursion.
 */
const FormioComponent = <S extends AnyComponentSchema>({
  component,
}: FormioComponentProps<S>): React.ReactElement<FormioComponentProps<S>> | null => {
  // need to help TypeScript in making clear that component and RenderComponent are actually aligned.
  // Our REGISTRY mapping enforces the type safety sufficiently.
  const RenderComponent = REGISTRY[component.type] as FormioComponentRenderer<S>;
  return <RenderComponent component={component} />;
};

export default FormioComponent;
