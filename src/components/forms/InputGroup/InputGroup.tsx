import {Fieldset, FieldsetLegend, Paragraph} from '@utrecht/component-library-react';

import {LabelContent} from '@/components/forms/Label';

export interface InputGroupProps {
  children?: React.ReactNode;
  label: React.ReactNode;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  'aria-describedby'?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({
  children,
  label,
  isRequired = false,
  isDisabled = false,
  isInvalid = false,
  'aria-describedby': ariaDescribedBy,
}) => (
  <Fieldset
    disabled={isDisabled}
    invalid={isInvalid}
    className="utrecht-form-fieldset--openforms"
    aria-describedby={ariaDescribedBy}
  >
    <FieldsetLegend className="utrecht-form-field__label">
      <LabelContent isDisabled={isDisabled} isRequired={isRequired}>
        {label}
      </LabelContent>
    </FieldsetLegend>
    <Paragraph className="openforms-input-group">{children}</Paragraph>
  </Fieldset>
);

export default InputGroup;
