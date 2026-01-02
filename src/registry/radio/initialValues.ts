import type {RadioComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';

const getInitialValues: GetInitialValues<RadioComponentSchema, string | null> = ({
  key,
  defaultValue = '',
}) => ({[key]: defaultValue});

export default getInitialValues;
