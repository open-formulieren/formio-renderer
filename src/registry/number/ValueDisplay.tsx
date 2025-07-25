import type {NumberComponentSchema} from '@open-formulieren/types';
import {FormattedNumber} from 'react-intl';

export interface ValueDisplayProps {
  componentDefinition: NumberComponentSchema;
  value: number | null;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({
  componentDefinition: {decimalLimit},
  value,
}) => {
  if (value === null) return '';
  return <FormattedNumber value={value} maximumFractionDigits={decimalLimit ?? 10} />;
};

export default ValueDisplay;
