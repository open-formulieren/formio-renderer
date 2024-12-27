import type {AnyComponentSchema} from '@open-formulieren/types';

import {getRegistryEntry} from '@/registry';

/**
 * The props that every field render component must support.
 *
 * The interface/props are generic in the component schema - make sure to narrow this
 * for the component-type specific props/component.
 */
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
  const entry = getRegistryEntry(componentDefinition);
  if (entry === undefined) {
    return (
      <div>
        Unkonwn component type <code>{componentDefinition.type}</code>
      </div>
    );
  }

  // components that support the 'hidden' property that are marked hidden may not be
  // displayed
  if ('hidden' in componentDefinition && componentDefinition.hidden) {
    return null;
  }

  const TypeSpecificComponent = entry.formField;
  return (
    <TypeSpecificComponent
      componentDefinition={componentDefinition}
      renderNested={FormioComponent}
    />
  );
};

export default FormioComponent;
