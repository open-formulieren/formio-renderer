import type {ChildDetails, ChildrenComponentSchema} from '@open-formulieren/types';
import {clsx} from 'clsx';
import {useFormikContext} from 'formik';

import HelpText from '@/components/forms/HelpText';
import Tooltip from '@/components/forms/Tooltip';
import {useFieldConfig} from '@/hooks';
import type {RegistryEntry} from '@/registry/types';

export interface FormioChildrenFieldProps {
  componentDefinition: ChildrenComponentSchema;
}

export const FormioChildrenField: React.FC<FormioChildrenFieldProps> = ({
  componentDefinition: {key, label, description, tooltip},
}) => {
  key = useFieldConfig(key);
  const {getFieldProps} = useFormikContext();
  const {value: children} = getFieldProps<ChildDetails[]>(key);

  return (
    <fieldset className="openforms-fieldset">
      <legend
        className={clsx('openforms-fieldset__legend', {
          'openforms-fieldset__legend--tooltip': !!tooltip,
        })}
      >
        {label}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </legend>

      {children.map(child => (
        <>
          <p>
            <b>BSN</b> {child.bsn}
          </p>
          <p>
            <b>First name</b> {child.firstNames}
          </p>
          <p>
            <b>Date of birth</b> {child.dateOfBirth}
          </p>
        </>
      ))}

      <HelpText>{description}</HelpText>
    </fieldset>
  );
};

const ChildrenFieldComponent: RegistryEntry<ChildrenComponentSchema> = {
  formField: FormioChildrenField,
};

export default ChildrenFieldComponent;
