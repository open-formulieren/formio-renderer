import type {TimeComponentSchema} from '@open-formulieren/types';
import {OrderedList, OrderedListItem} from '@utrecht/component-library-react';
import {FormattedTime} from 'react-intl';

import './ValueDisplay.scss';

export interface ValueDisplayProps {
  componentDefinition: TimeComponentSchema;
  value: string | string[] | undefined;
}

const formatTime = (timeValue: string): React.ReactNode => {
  if (!timeValue) return '-';

  // FormattedTime expects a Date object
  let time = new Date(timeValue);

  if (isNaN(Number(time))) {
    const [hours, minutes, seconds] = timeValue.split(':');
    time = new Date();
    time.setHours(parseInt(hours));
    time.setMinutes(parseInt(minutes));
    time.setSeconds(parseInt(seconds));
  }

  return (
    <FormattedTime value={time} format="short" hour="numeric" minute="numeric" second="numeric" />
  );
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
          <OrderedListItem key={`item-${index}-${item}`}>{formatTime(item)}</OrderedListItem>
        ))}
      </OrderedList>
    );
  }

  return formatTime(normalizedValue);
};

export default ValueDisplay;
