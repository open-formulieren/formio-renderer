import DOMPurify from 'dompurify';

import './InputContainer.scss';

export interface InputContainerProps {
  children: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

const InputContainer: React.FC<InputContainerProps> = ({children, prefix, suffix}) => (
  <div className="openforms-input-container">
    {prefix && (
      <span
        className="openforms-input-container__affix openforms-input-container__affix--prefix"
        dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(prefix)}}
      />
    )}

    {children}

    {suffix && (
      <span
        className="openforms-input-container__affix openforms-input-container__affix--suffix"
        dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(suffix)}}
      />
    )}
  </div>
);

export default InputContainer;
