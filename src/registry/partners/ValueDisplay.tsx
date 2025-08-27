import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';

import PartnersList from '@/components/forms/Partners/PartnersList';

export interface ValueDisplayProps {
  componentDefinition: PartnersComponentSchema;
  value: PartnerDetails[];
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({value}) => {
  if (!value.length) return '';
  return <PartnersList partners={value} />;
};

export default ValueDisplay;
