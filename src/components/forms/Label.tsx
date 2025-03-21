import {FormLabel, Paragraph} from '@utrecht/component-library-react';
import clsx from 'clsx';
import {FormattedMessage} from 'react-intl';

import {useRendererSettings} from '@/hooks';

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
  const {requiredFieldsWithAsterisk} = useRendererSettings();

  const addNotRequiredSuffix = !isRequired && !requiredFieldsWithAsterisk;

  return (
    <FormLabel
      htmlFor={id}
      disabled={isDisabled}
      className={clsx({
        'utrecht-form-label--openforms': true,
        'utrecht-form-label--openforms-required': isRequired && requiredFieldsWithAsterisk,
        [`utrecht-form-label--${type}`]: type,
      })}
    >
      <FormattedMessage
        description="Form field label content/wrapper"
        defaultMessage={`{addNotRequiredSuffix, select,
          true {{label} (not required)}
          other {{label}}
        }`}
        values={{
          label: children,
          addNotRequiredSuffix,
        }}
      />
    </FormLabel>
  );
};

LabelContent.displayName = 'LabelContent';

export interface LabelProps {
  // id prop is only optional when the label cannot be associated with a single form element
  id?: string;
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

Label.displayName = 'Label';

export default Label;
