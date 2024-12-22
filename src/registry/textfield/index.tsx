import type {TextFieldComponentSchema} from '@open-formulieren/types';

export interface TextFieldProps {
  componentDefinition: TextFieldComponentSchema;
}

const TextField: React.FC<TextFieldProps> = ({componentDefinition: {key, label}}) => {
  return (
    <div>
      I am a text field with name {key} and label {label}!
    </div>
  );
};

export default TextField;
