import type {FieldsetComponentSchema} from '@open-formulieren/types';

export interface FieldsetProps {
  componentDefinition: FieldsetComponentSchema;
}

const Fieldset: React.FC<FieldsetProps> = ({componentDefinition: {components}}) => {
  return <div>I am a fieldset field with {components.length} child components.</div>;
};

export default Fieldset;
