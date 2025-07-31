import {useId} from 'react';

import './SoftRequiredErrors.scss';
import SoftRequiredErrorsMessage from './SoftRequiredErrorsMessage';

export interface SoftRequiredComponent {
  /**
   * The path to the component in the form values dict.
   */
  pathToComponent: string;
  /**
   * The label of the component.
   */
  label: string;
}

export interface SoftRequiredErrorsProps {
  /**
   * The message that will be displayed when the form has soft required fields that are
   * still empty. The string could/should contain the `{{ missingFields }}` tag, this
   * will be replaced with a list of the soft required fields that are empty.
   *
   * The `html` field is populated using a WYSIWYG editor, so expect the string to
   * contain html tags.
   */
  html: string;
}

const SoftRequiredErrors: React.FC<SoftRequiredErrorsProps> = ({html}) => {
  const id = useId();
  const missingFields: SoftRequiredComponent[] = [
    {pathToComponent: "", label: "Textfield"}
  ];

  if (!missingFields.length) {
    return null;
  }

  return (
    <div
      id={`${id}-content`}
      className="utrecht-alert utrecht-alert--warning openforms-soft-required-errors"
      role="status"
    >
      <div className="utrecht-alert__icon">
        <i className="fa fas fa-exclamation-triangle"></i>
      </div>
      <div className="utrecht-alert__message">
        <SoftRequiredErrorsMessage id={id} html={html} missingFields={missingFields} />
      </div>
    </div>
  );
};

SoftRequiredErrors.displayName = 'SoftRequiredErrors';

export default SoftRequiredErrors;
