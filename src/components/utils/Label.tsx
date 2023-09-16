import {FormLabel, Paragraph} from '@utrecht/component-library-react';
import {FormLabelProps} from '@utrecht/component-library-react/dist/FormLabel';
import clsx from 'clsx';
import {PropsWithChildren} from 'react';
import {FormattedMessage} from 'react-intl';

import {useConfigurationContext} from '@/context';

export interface LabelContentProps extends FormLabelProps {
  isRequired?: boolean;
}

export const LabelContent: React.FC<PropsWithChildren<LabelContentProps>> = ({
  id,
  isRequired = false,
  disabled = false,
  type,
  children,
}) => {
  const {asteriskForRequired} = useConfigurationContext();
  return (
    <FormLabel
      htmlFor={id}
      disabled={disabled}
      className={clsx({
        'utrecht-form-label--openforms-required': isRequired,
        [`utrecht-form-label--${type}`]: type,
      })}
    >
      <FormattedMessage
        description="Form field label, field possibly optional"
        defaultMessage="{withAsterisk, select, true {<label></label>} other {<label></label> (optional)}}"
        values={{
          withAsterisk: asteriskForRequired,
          label: () => children,
        }}
      />
    </FormLabel>
  );
};

export interface LabelProps extends FormLabelProps {
  isRequired?: boolean;
}

export const Label: React.FC<PropsWithChildren<LabelProps>> = ({
  id,
  isRequired = false,
  disabled = false,
  type,
  children,
}) => (
  <Paragraph className="utrecht-form-field__label">
    <LabelContent id={id} isRequired={isRequired} disabled={disabled} type={type}>
      {children}
    </LabelContent>
  </Paragraph>
);

export default Label;
