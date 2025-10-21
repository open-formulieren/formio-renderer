import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';

import PartnersPreview from './PartnersPreview';
import type {ManuallyAddedPartnerDetails} from './types';

export interface ValueDisplayProps {
  componentDefinition: PartnersComponentSchema;
  value: PartnerDetails[] | ManuallyAddedPartnerDetails[];
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({value}) => {
  if (!value?.length) return '';
  return <PartnersPreview partners={value} />;
};

export default ValueDisplay;
