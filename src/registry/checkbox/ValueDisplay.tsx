import type {CheckboxComponentSchema} from '@open-formulieren/types';
import {FormattedMessage} from 'react-intl';

export interface ValueDisplayProps {
  componentDefinition: CheckboxComponentSchema;
  value: boolean;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({value}) => {
  if (value) {
    return <FormattedMessage description="'True' display" defaultMessage="Yes" />;
  }
  return <FormattedMessage description="'False' display" defaultMessage="No" />;
};

export default ValueDisplay;
