import parse, {DOMNode} from 'html-react-parser';
import {FormattedMessage} from 'react-intl';

import type {SoftRequiredComponent} from './utils';

interface SoftRequiredErrorsMessageProps {
  id: string;
  html: string;
  missingFields: SoftRequiredComponent[];
}

const SoftRequiredErrorsMessage: React.FC<SoftRequiredErrorsMessageProps> = ({
  id,
  html,
  missingFields,
}) => {
  const htmlWithMissingFieldsTag = html.replace(
    '{{ missingFields }}',
    '<missing-fields></missing-fields>'
  );

  return parse(htmlWithMissingFieldsTag, {
    replace: (domNode: DOMNode) => {
      // Check if DomNode is an element
      if (domNode.nodeType === 1 && domNode.name === 'missing-fields') {
        return (
          <>
            <span className="sr-only" id={`${id}-missing-fields-header`}>
              <FormattedMessage
                description="SoftRequiredErrors header"
                defaultMessage="Empty fields"
              />
            </span>
            <ul
              className="utrecht-unordered-list openforms-soft-required-errors__missing-fields"
              aria-labelledby={`${id}-missing-fields-header`}
            >
              {missingFields.map(missingField => (
                <li key={missingField.pathToComponent} className="utrecht-unordered-list__item">
                  {missingField.label}
                </li>
              ))}
            </ul>
          </>
        );
      }
      return domNode;
    },
  });
};
SoftRequiredErrorsMessage.displayName = 'SoftRequiredErrorsMessage';

export default SoftRequiredErrorsMessage;
