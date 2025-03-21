import type {EmailComponentSchema} from '@open-formulieren/types';
import {OrderedList, OrderedListItem, URLValue} from '@utrecht/component-library-react';

import './ValueDisplay.scss';

export interface ValueDisplayProps {
  componentDefinition: EmailComponentSchema;
  value: string | string[] | undefined;
}

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
          <OrderedListItem key={`item-${index}-${item}`}>
            <URLValue>{item}</URLValue>
          </OrderedListItem>
        ))}
      </OrderedList>
    );
  }

  return <URLValue>{normalizedValue}</URLValue>;
};

export default ValueDisplay;
