import clsx from 'clsx';
import {PropsWithChildren} from 'react';

import {useConfigurationContext} from '@/context';

const Wrapper: React.FC<PropsWithChildren> = ({children}) => {
  const {asteriskForRequired} = useConfigurationContext();
  return (
    <div
      className={clsx('openforms-form-control', {
        'openforms-form-control--no-asterisks': !asteriskForRequired,
      })}
    >
      {children}
    </div>
  );
};

export default Wrapper;
