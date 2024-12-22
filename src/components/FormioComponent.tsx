import type {AnyComponentSchema} from '@open-formulieren/types';

export interface FormioComponentProps {
  /**
   * The Formio.js component definition, limited to the features supported in Open Forms.
   */
  componentDefinition: AnyComponentSchema;
}

/**
 * Render a single formio component definition as a form field/component.
 */
const FormioComponent: React.FC<FormioComponentProps> = ({componentDefinition}) => {
  return <div>Type: {componentDefinition.type}</div>;
};

export default FormioComponent;
