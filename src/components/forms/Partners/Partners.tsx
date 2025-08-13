import type {PartnerDetails} from '@open-formulieren/types';
import {FormField} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';

import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';

import './Partners.scss';
import PartnersList from './PartnersList';

export interface PartnerProps {
  /**
   * Name of 'form field' in the Formio form data structure. The rendered edit grid items
   * are based off the value of this field.
   */
  name: string;
  /**
   * The (accessible) label for the field - anything that can be rendered.
   */
  label: React.ReactNode;
  /**
   * Additional description displayed close to the field - use this to document any
   * validation requirements that are crucial to successfully submit the form. More
   * information that is contextual/background typically belongs in a tooltip.
   */
  description?: React.ReactNode;
  /**
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
}

const Partners: React.FC<PartnerProps> = ({name, label, tooltip, description}) => {
  const {getFieldProps} = useFormikContext();
  const {value: partners} = getFieldProps<PartnerDetails[] | undefined>(name);

  return (
    <FormField type="partners" className="utrecht-form-field--openforms">
      <Label tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}>{label}</Label>
      {partners?.length ? <PartnersList partners={partners} /> : null}
      [add partner] [edit partner]
      <HelpText>{description}</HelpText>
    </FormField>
  );
};

export default Partners;
