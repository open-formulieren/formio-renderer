import type {SelectComponentSchema} from '@open-formulieren/types';
import {OrderedList, OrderedListItem} from '@utrecht/component-library-react';

import {assertManualValues} from './types';

export interface ValueDisplayProps {
  componentDefinition: SelectComponentSchema;
  value: string | string[];
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({componentDefinition, value}) => {
  assertManualValues(componentDefinition);
  const {
    data: {values: options},
  } = componentDefinition;

  if (!Array.isArray(value)) {
    const option = options.find(opt => opt.value === value);
    return <>{option?.label ?? value}</>;
  }

  const selectedOptions = options.filter(opt => value.includes(opt.value));
  if (!selectedOptions.length) {
    return null;
  }

  return (
    <OrderedList>
      {selectedOptions.map(({value, label}) => (
        <OrderedListItem key={value}>{label ?? value}</OrderedListItem>
      ))}
    </OrderedList>
  );
};

export default ValueDisplay;
