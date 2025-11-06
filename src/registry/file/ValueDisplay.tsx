import type {FileComponentSchema} from '@open-formulieren/types';
import {OrderedList, OrderedListItem} from '@utrecht/component-library-react';

import './ValueDisplay.scss';
import type {FormikFileUpload} from './types';

export interface ValueDisplayProps {
  componentDefinition: FileComponentSchema;
  value: FormikFileUpload[] | undefined;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({
  componentDefinition: {multiple = false},
  value,
}) => {
  const normalizedValue = value ?? [];
  if (!normalizedValue.length) return '';

  // if only a single upload is allowed, there are 0 or 1 uploads. Grab the first.
  if (!multiple) {
    return normalizedValue[0].originalName;
  }

  return (
    <OrderedList>
      {normalizedValue.map(item => (
        <OrderedListItem key={`${item.clientId || item.url}`}>{item.originalName}</OrderedListItem>
      ))}
    </OrderedList>
  );
};

export default ValueDisplay;
