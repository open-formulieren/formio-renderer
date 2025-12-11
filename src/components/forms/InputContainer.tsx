import DOMPurify from 'dompurify';
import {useId} from 'react';

import './InputContainer.scss';

export interface InputContainerProps {
  /**
   * The id of the input element.
   *
   * This is required for a proper accessibility label. The id is included in the
   * aria-labelledby for consistency with the current SDK implementation and
   * NL-design system.
   */
  inputId: string;
  /**
   * The id of the label element that is associated with the input.
   *
   * This is required for a proper accessibility label. aria-labelledby takes precedence
   * over any other form of labeling. By providing the labelId, the input container can
   * automatically add it to the aria-labelledby attribute of the input, which insures
   * that the label and input stay connected.
   */
  labelId: string;
  prefix?: string;
  suffix?: string;
  /**
   * Callback to render the input inside the inputContainer. Gets passed the aria-labelledby
   * which contains the labelId, inputId, prefixId and fieldId.
   */
  renderInput: (ariaLabelledBy: string) => React.ReactNode;
}

const InputContainer: React.FC<InputContainerProps> = ({
  inputId,
  labelId,
  renderInput,
  prefix,
  suffix,
}) => {
  const id = useId();
  const prefixId = prefix ? `${id}-prefix` : undefined;
  const suffixId = suffix ? `${id}-suffix` : undefined;

  const ariaLabelledBy = [labelId, prefixId, inputId, suffixId].filter(Boolean).join(' ');

  return (
    <div className="openforms-input-container">
      {prefix && (
        <span
          id={prefixId}
          className="openforms-input-container__affix openforms-input-container__affix--prefix"
          dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(prefix)}}
        />
      )}

      {renderInput(ariaLabelledBy)}

      {suffix && (
        <span
          id={suffixId}
          className="openforms-input-container__affix openforms-input-container__affix--suffix"
          dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(suffix)}}
        />
      )}
    </div>
  );
};

export default InputContainer;
