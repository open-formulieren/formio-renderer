import type {SelectComponentSchema} from '@open-formulieren/types';

import Select from '@/components/forms/Select';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import {assertManualValues} from './types';
import getValidationSchema from './validationSchema';

export interface FormioSelectProps {
  componentDefinition: SelectComponentSchema;
}

export const FormioSelect: React.FC<FormioSelectProps> = ({componentDefinition}) => {
  assertManualValues(componentDefinition);
  const {
    key,
    label,
    description,
    tooltip,
    data: {values: options},
    multiple,
    validate,
  } = componentDefinition;
  return (
    <Select
      name={key}
      label={label}
      options={options}
      isMulti={multiple}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
      noOptionSelectedValue=""
    />
  );
};

const SelectComponent: RegistryEntry<SelectComponentSchema> = {
  formField: FormioSelect,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default SelectComponent;
