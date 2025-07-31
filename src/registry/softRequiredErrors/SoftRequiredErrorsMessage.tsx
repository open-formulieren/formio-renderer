import type {SoftRequiredComponent} from './index';

interface SoftRequiredErrorsMessageProps {
  html: string;
  missingFields: SoftRequiredComponent[];
}

const SoftRequiredErrorsMessage: React.FC<SoftRequiredErrorsMessageProps> = ({html}) => {
  // @TODO
  return <div dangerouslySetInnerHTML={{__html: html}}></div>;
};
SoftRequiredErrorsMessage.displayName = 'SoftRequiredErrorsMessage';

export default SoftRequiredErrorsMessage;
