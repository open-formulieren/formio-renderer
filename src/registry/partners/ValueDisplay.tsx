import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';
import {OrderedList, OrderedListItem} from '@utrecht/component-library-react';

import PartnerPreview from './PartnerPreview';
import type {ManuallyAddedPartnerDetails} from './types';

export interface ValueDisplayProps {
  componentDefinition: PartnersComponentSchema;
  value: PartnerDetails[] | ManuallyAddedPartnerDetails[];
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({value}) => {
  if (!value?.length) return '';

  return (
    <OrderedList>
      {value.map((partner, index) => (
        <OrderedListItem key={index}>
          <PartnerPreview partner={partner} />
        </OrderedListItem>
      ))}
    </OrderedList>
  );
};

export default ValueDisplay;
