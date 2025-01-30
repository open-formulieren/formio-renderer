import {Fieldset, FieldsetLegend, Paragraph} from '@utrecht/component-library-react';

import {LabelContent} from '@/components/forms/Label';

export interface InputGroupProps {
  children?: React.ReactNode;
  label: React.ReactNode;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({
  children,
  label,
  isRequired = true,
  isDisabled = false,
  isInvalid = false,
}) => (
  <Fieldset disabled={isDisabled} invalid={isInvalid} className="utrecht-form-fieldset--openforms">
    <FieldsetLegend className="utrecht-form-field__label">
      <LabelContent isDisabled={isDisabled} isRequired={isRequired}>
        {label}
      </LabelContent>
    </FieldsetLegend>
    <Paragraph className="openforms-input-group">{children}</Paragraph>
  </Fieldset>
);

export default InputGroup;
