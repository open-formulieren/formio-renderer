import type {CosignV2ComponentSchema} from '@open-formulieren/types';
import {URLValue} from '@utrecht/component-library-react';

import './ValueDisplay.scss';

export interface ValueDisplayProps {
  componentDefinition: CosignV2ComponentSchema;
  value: string | undefined;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({value}) => {
  const normalizedValue = value ?? '';
  return <URLValue>{normalizedValue}</URLValue>;
};

export default ValueDisplay;
