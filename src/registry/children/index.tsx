import type {ChildDetails, ChildrenComponentSchema} from '@open-formulieren/types';
import {useFormikContext} from 'formik';
import {useId} from 'react';

import Fieldset from '@/components/forms/Fieldset';
import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import {useFieldConfig} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

import ChildrenTable from './ChildrenTable';

export interface FormioChildrenFieldProps {
  componentDefinition: ChildrenComponentSchema;
}

export const FormioChildrenField: React.FC<FormioChildrenFieldProps> = ({
  componentDefinition: {key, label, description, tooltip},
}) => {
  const id = useId();
  key = useFieldConfig(key);
  const {getFieldProps} = useFormikContext();
  const {value: children} = getFieldProps<ChildDetails[]>(key);

  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <Fieldset
      header={
        <>
          {label}
          {tooltip && <Tooltip>{tooltip}</Tooltip>}
        </>
      }
      hasTooltip={!!tooltip}
      aria-describedby={descriptionId || undefined}
    >
      <ChildrenTable values={children} />

      <HelpText id={descriptionId}>{description}</HelpText>
    </Fieldset>
  );
};

const ChildrenFieldComponent: RegistryEntry<ChildrenComponentSchema> = {
  formField: FormioChildrenField,
};

export default ChildrenFieldComponent;
