import type {AnyComponentSchema} from '@open-formulieren/types';

import {getRegistryEntry} from '@/registry';

export interface FormioComponentProps<S extends AnyComponentSchema = AnyComponentSchema> {
  /**
   * The Formio.js component definition, limited to the features supported in Open Forms.
   */
  componentDefinition: S;
}

/**
 * Render a single formio component definition as a form field/component.
 */
const FormioComponent: React.FC<FormioComponentProps> = ({componentDefinition}) => {
  const TypeSpecificComponent = getRegistryEntry(componentDefinition);
  if (TypeSpecificComponent === undefined) {
    return (
      <div>
        Unkonwn component type <code>{componentDefinition.type}</code>
      </div>
    );
  }
  return <TypeSpecificComponent componentDefinition={componentDefinition} />;
};

export default FormioComponent;
