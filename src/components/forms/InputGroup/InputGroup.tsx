import {Fieldset, FieldsetLegend, Paragraph} from '@utrecht/component-library-react';
import clsx from 'clsx';
import {useId} from 'react';

import {LabelContent} from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';

export interface InputGroupProps {
  children?: React.ReactNode;
  label: React.ReactNode;
  /**
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  'aria-describedby'?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({
  children,
  label,
  tooltip,
  isRequired = false,
  isDisabled = false,
  isInvalid = false,
  'aria-describedby': ariaDescribedBy,
}) => {
  const id = useId();
  const tooltipId = tooltip ? `${id}-tooltip` : undefined;
  return (
    <Fieldset
      disabled={isDisabled}
      invalid={isInvalid}
      className="utrecht-form-fieldset--openforms"
      aria-describedby={[ariaDescribedBy, tooltipId].filter(Boolean).join(' ')}
      data-testid="inputgroup-container"
    >
      <FieldsetLegend
        className={clsx({'utrecht-form-fieldset__legend--openforms-tooltip': !!tooltip})}
      >
        <LabelContent isDisabled={isDisabled} isRequired={isRequired}>
          {label}
        </LabelContent>
        {tooltip && <Tooltip id={tooltipId}>{tooltip}</Tooltip>}
      </FieldsetLegend>
      <Paragraph className="openforms-input-group">{children}</Paragraph>
    </Fieldset>
  );
};

InputGroup.displayName = 'InputGroup';

export default InputGroup;
