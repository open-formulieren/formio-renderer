import type {SignatureComponentSchema} from '@open-formulieren/types';
import {useIntl} from 'react-intl';

export interface ValueDisplayProps {
  componentDefinition: SignatureComponentSchema;
  value: string;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({value}) => {
  const intl = useIntl();
  if (!value) return value;

  return (
    <img
      src={value}
      alt={intl.formatMessage({
        description: 'Signature value alt text',
        defaultMessage: 'Signature',
      })}
    />
  );
};

export default ValueDisplay;
