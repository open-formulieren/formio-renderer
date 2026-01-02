import type {SelectboxesComponentSchema} from '@open-formulieren/types';
import {OrderedList, OrderedListItem} from '@utrecht/component-library-react';

export interface ValueDisplayProps {
  componentDefinition: SelectboxesComponentSchema;
  value: Record<string, boolean>;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({componentDefinition, value}) => {
  const selectedOptions = componentDefinition.values.filter(opt => value[opt.value]);
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
