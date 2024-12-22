import type {FieldsetComponentSchema} from '@open-formulieren/types';

import FormioComponent from '@/components/FormioComponent';

export interface FieldsetProps {
  componentDefinition: FieldsetComponentSchema;
}

const Fieldset: React.FC<FieldsetProps> = ({componentDefinition: {components}}) => {
  return (
    <div>
      I am a fieldset field with {components.length} child components. The nested children are:
      {components.map(nestedDefinition => (
        <FormioComponent key={nestedDefinition.id} componentDefinition={nestedDefinition} />
      ))}
    </div>
  );
};

export default Fieldset;
