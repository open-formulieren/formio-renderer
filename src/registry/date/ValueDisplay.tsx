import type {DateComponentSchema} from '@open-formulieren/types';
import {OrderedList, OrderedListItem} from '@utrecht/component-library-react';
import {FormattedDate} from 'react-intl';

import './ValueDisplay.scss';

export interface ValueDisplayProps {
  componentDefinition: DateComponentSchema;
  value: string | string[] | undefined;
}

const formatDate = (dateValue: string): React.ReactNode => {
  if (!dateValue) return '-';
  return <FormattedDate value={dateValue} year="numeric" day="numeric" month="long" />;
};

const ValueDisplay: React.FC<ValueDisplayProps> = ({
  componentDefinition: {multiple = false},
  value,
}) => {
  const emptyValue: string | string[] = multiple ? [] : '';
  const normalizedValue = value ?? emptyValue;

  // in edge cases the existing data & component.multiple may be misaligned (updating form definitions
  // for existing submissions), so look at the actual data type rather than what it *should* be.
  if (Array.isArray(normalizedValue)) {
    if (!normalizedValue.length) return '';
    return (
      <OrderedList>
        {normalizedValue.map((item, index) => (
          <OrderedListItem key={`item-${index}-${item}`}>{formatDate(item)}</OrderedListItem>
        ))}
      </OrderedList>
    );
  }

  return formatDate(normalizedValue);
};

export default ValueDisplay;
