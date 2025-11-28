import {UnorderedList, UnorderedListItem} from '@utrecht/component-library-react';
import {useId} from 'react';
import {FormattedMessage} from 'react-intl';

import DynamicFormattedMessage from '@/components/DynamicFormattedMessage';

import type {MissingFields} from './missingFields';

interface SoftRequiredErrorsListProps {
  missingFields: MissingFields[];
}

const SoftRequiredErrorsList: React.FC<SoftRequiredErrorsListProps> = ({missingFields}) => {
  const id = useId();
  return (
    <>
      <span className="sr-only" id={`${id}-missing-fields-header`}>
        <FormattedMessage description="SoftRequiredErrors header" defaultMessage="Empty fields" />
      </span>
      <UnorderedList aria-labelledby={`${id}-missing-fields-header`}>
        {missingFields.map(missingField => (
          <UnorderedListItem key={missingField.pathToComponent}>
            {missingField.label}
          </UnorderedListItem>
        ))}
      </UnorderedList>
    </>
  );
};

interface SoftRequiredErrorsMessageProps {
  html: string;
  missingFields: MissingFields[];
}

const SoftRequiredErrorsMessage: React.FC<SoftRequiredErrorsMessageProps> = ({
  html,
  missingFields,
}) => {
  // The intl formatter expects variables to be wrapped with single curly brackets,
  // so we have to replace the double brackets with single brackets.
  const convertedHtml = html.replace(/{{\s*missingFields\s*}}/, '{ missingFields }');

  return (
    <DynamicFormattedMessage
      description="SoftRequiredErrors missing fields message"
      defaultMessage={convertedHtml}
      asHtml
      values={{
        missingFields: <SoftRequiredErrorsList missingFields={missingFields} />,
      }}
    />
  );
};
SoftRequiredErrorsMessage.displayName = 'SoftRequiredErrorsMessage';

export default SoftRequiredErrorsMessage;
