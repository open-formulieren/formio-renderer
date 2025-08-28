import {FormattedMessage} from 'react-intl';

import {getBEMClassName} from '../utils';
import './Loader.scss';

export const MODIFIERS = ['centered', 'only-child', 'small', 'gray'] as const;

export interface LoaderProps {
  modifiers?: (typeof MODIFIERS)[number][];
  loading: boolean;
}

const Loader: React.FC<LoaderProps> = ({modifiers = [], loading}) => {
  const className = getBEMClassName('loading', modifiers);
  return (
    <div className={className} role="status">
      {loading && (
        <>
          <span className={getBEMClassName('loading__spinner')} />
          <span className="sr-only">
            <FormattedMessage description="Loading content text" defaultMessage="Loading..." />
          </span>
        </>
      )}
    </div>
  );
};

export default Loader;
