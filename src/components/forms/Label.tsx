import {FormLabel} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
import {FormattedMessage} from 'react-intl';

import {useFormSettings} from '@/hooks';

import './Label.scss';

export interface LabelContentProps {
  id?: string;
  children: React.ReactNode;
  isDisabled?: boolean;
  isRequired?: boolean;
  type?: string;
  noLabelTag?: boolean;
  /**
   * HTML ID for the label element itself, so that it can be referenced by
   * aria-labeledby.
   */
  labelId?: string;
  /**
   * Sometimes the label should never get an asterisk or suffix for the required state,
   * e.g. when the checkbox is part of a larger component (like selectboxes).
   */
  noOptionalSuffix?: boolean;
}

/**
 * A wrapper around label content, using the utrecht-form-label CSS class.
 */
export const LabelContent: React.FC<LabelContentProps> = ({
  id,
  isDisabled = false,
  isRequired = false,
  type,
  noLabelTag = false,
  labelId,
  noOptionalSuffix = false,
  children,
}) => {
  const {requiredFieldsWithAsterisk} = useFormSettings();

  const addNotRequiredSuffix = !isRequired && !requiredFieldsWithAsterisk && !noOptionalSuffix;

  const Component = noLabelTag ? 'span' : FormLabel;

  return (
    <Component
      id={labelId}
      htmlFor={id}
      disabled={isDisabled}
      className={clsx({
        'utrecht-form-label': noLabelTag,
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
    </Component>
  );
};

LabelContent.displayName = 'LabelContent';

export interface LabelProps {
  // id prop is only optional when the label cannot be associated with a single form element
  id?: string;
  children: React.ReactNode;
  isDisabled?: boolean;
  isRequired?: boolean;
  tooltip?: React.ReactNode;
  /**
   * Render the label in a `span` rather than a `label` tag.
   *
   * @warning ensure you know what you're doing, as incorrectly specifying this will
   * affect accessibility negatively!
   */
  noLabelTag?: boolean;
  /**
   * HTML ID for the label element itself, so that it can be referenced by
   * aria-labeledby.
   */
  labelId?: string;
}

const Label: React.FC<LabelProps> = ({
  id,
  isRequired = false,
  isDisabled = false,
  tooltip,
  noLabelTag = false,
  labelId,
  children,
}) => (
  <div
    className={clsx('utrecht-form-field__label', {
      'utrecht-form-field__label--openforms-tooltip': !!tooltip,
    })}
  >
    <LabelContent
      id={id}
      labelId={labelId}
      isRequired={isRequired}
      isDisabled={isDisabled}
      noLabelTag={noLabelTag}
    >
      {children}
    </LabelContent>
    {tooltip}
  </div>
);

Label.displayName = 'Label';

export default Label;
