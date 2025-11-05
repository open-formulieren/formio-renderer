import {Link} from '@utrecht/component-library-react';

import './PortalUrl.scss';
import {useCustomerProfileComponentParameters} from './hooks';

interface PortalUrlProps {
  children: React.ReactNode;
}

const PortalUrl: React.FC<PortalUrlProps> = ({children}) => {
  const {portalUrl} = useCustomerProfileComponentParameters();
  return (
    <Link href={portalUrl} target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  );
};

export default PortalUrl;
