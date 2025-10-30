import type {ChildrenComponentSchema} from '@open-formulieren/types';
import {OrderedList, OrderedListItem} from '@utrecht/component-library-react';

import ChildPreview from './ChildPreview';
import type {ExtendedChildDetails} from './types';

export interface ValueDisplayProps {
  componentDefinition: ChildrenComponentSchema;
  value: ExtendedChildDetails[];
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({value}) => {
  if (!value?.length) return '';

  return (
    <OrderedList>
      {(value as ExtendedChildDetails[]).map((child, index) => (
        <OrderedListItem key={index}>
          <ChildPreview childData={child} />
        </OrderedListItem>
      ))}
    </OrderedList>
  );
};

export default ValueDisplay;
