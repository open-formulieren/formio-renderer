import type {CurrencyComponentSchema} from '@open-formulieren/types';
import {FormattedNumber} from 'react-intl';

export interface ValueDisplayProps {
  componentDefinition: CurrencyComponentSchema;
  value: number | null;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({
  componentDefinition: {currency, decimalLimit},
  value,
}) => {
  if (value === null) return '';
  return (
    <FormattedNumber
      value={value}
      maximumFractionDigits={decimalLimit ?? 2}
      style="currency"
      currency={currency}
    />
  );
};

export default ValueDisplay;
