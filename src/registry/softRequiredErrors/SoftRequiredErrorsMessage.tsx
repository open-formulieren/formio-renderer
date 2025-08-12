import {MissingFields} from './missingFields';

interface SoftRequiredErrorsMessageProps {
  html: string;
  missingFields: MissingFields[];
}

const SoftRequiredErrorsMessage: React.FC<SoftRequiredErrorsMessageProps> = ({html}) => {
  // @TODO
  return <div dangerouslySetInnerHTML={{__html: html}}></div>;
};
SoftRequiredErrorsMessage.displayName = 'SoftRequiredErrorsMessage';

export default SoftRequiredErrorsMessage;
