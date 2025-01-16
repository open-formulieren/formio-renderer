import {FormLabel, Paragraph} from '@utrecht/component-library-react';
import clsx from 'clsx';

import './Label.scss';

export interface LabelContentProps {
  id?: string;
  children: React.ReactNode;
  isDisabled?: boolean;
  isRequired?: boolean;
  type?: string;
}

export const LabelContent: React.FC<LabelContentProps> = ({
  id,
  isDisabled = false,
  isRequired = false,
  type,
  children,
}) => {
  // TODO: add support for required-fields-with-asterisk configuration (via context)
  return (
    <FormLabel
      htmlFor={id}
      disabled={isDisabled}
      className={clsx({
        'utrecht-form-label--openforms': true,
        'utrecht-form-label--openforms-required': isRequired,
        [`utrecht-form-label--${type}`]: type,
      })}
    >
      {children}
    </FormLabel>
  );
};

export interface LabelProps {
  id: string;
  children: React.ReactNode;
  isDisabled?: boolean;
  isRequired?: boolean;
}

const Label: React.FC<LabelProps> = ({id, isRequired = false, isDisabled = false, children}) => (
  <Paragraph className="utrecht-form-field__label">
    <LabelContent id={id} isRequired={isRequired} isDisabled={isDisabled}>
      {children}
    </LabelContent>
  </Paragraph>
);

export default Label;
