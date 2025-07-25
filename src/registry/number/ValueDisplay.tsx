import type {NumberComponentSchema} from '@open-formulieren/types';
import {useIntl} from 'react-intl';

export interface ValueDisplayProps {
  componentDefinition: NumberComponentSchema;
  value: number | null;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({
  // @ts-ignore
  componentDefinition,
  value,
}) => {
  const {locale} = useIntl();

  if (value === null) return '';
  return new Intl.NumberFormat(locale).format(value);
};

export default ValueDisplay;
