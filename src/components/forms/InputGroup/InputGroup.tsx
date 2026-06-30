import type {FAQItem} from '@open-formulieren/types/dist/common';
import {Paragraph} from '@utrecht/component-library-react';
import {Fieldset, FieldsetLegend} from '@utrecht/fieldset-react';
import {clsx} from 'clsx';

import {LabelContent} from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';

import FAQTooltip from '../FAQTooltip';

export interface InputGroupProps {
  children?: React.ReactNode;
  label: React.ReactNode;
  /**
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
  faqItems?: FAQItem[];
  isReadOnly?: boolean;
  isRequired?: boolean;
  name?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({
  children,
  label,
  tooltip,
  isRequired = false,
  isReadOnly = false,
  faqItems = [],
  name,
}) => (
  <Fieldset
    className="utrecht-form-fieldset--openforms"
    name={name}
    data-testid="inputgroup-container"
  >
    <FieldsetLegend
      className={clsx({'utrecht-form-fieldset__legend--openforms-tooltip': !!tooltip})}
    >
      <LabelContent isDisabled={isReadOnly} isRequired={isRequired} noLabelTag>
        {label}
      </LabelContent>
      {tooltip && <Tooltip>{tooltip}</Tooltip>}
    </FieldsetLegend>
    <Paragraph className="openforms-input-group">{children}</Paragraph>

    {faqItems.map((faqItem, index) => (
      <FAQTooltip key={index} faqItem={faqItem} />
    ))}
  </Fieldset>
);

InputGroup.displayName = 'InputGroup';

export default InputGroup;
