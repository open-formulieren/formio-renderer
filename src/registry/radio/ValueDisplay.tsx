import type {RadioComponentSchema} from '@open-formulieren/types';

import {assertManualValues} from './types';

export interface ValueDisplayProps {
  componentDefinition: RadioComponentSchema;
  value: string;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({componentDefinition, value}) => {
  assertManualValues(componentDefinition);
  const option = componentDefinition.values.find(opt => opt.value === value);
  return <>{option?.label ?? value}</>;
};

export default ValueDisplay;
