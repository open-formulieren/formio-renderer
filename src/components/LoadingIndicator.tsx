import {clsx} from 'clsx';
import {FormattedMessage} from 'react-intl';

import './LoadingIndicator.scss';

export interface LoadingIndicatorProps {
  /**
   * Accessible description for the loading indicator. If not specified, a default is
   * used.
   */
  description?: React.ReactNode;
  /**
   * Specify position. The default is `start`.`
   */
  position?: 'start' | 'center' | 'end';
  /**
   * Specify size variant.
   */
  size?: 'normal' | 'small';
  /**
   * Specify color variant.
   */
  color?: 'normal' | 'muted';
  // for testing/snapshot reasons
  disableAnimation?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  description,
  position = 'start',
  size = 'normal',
  color = 'normal',
  disableAnimation = false,
}) => (
  <div
    className={clsx(
      'openforms-loading-indicator',
      `openforms-loading-indicator--pos-${position}`,
      `openforms-loading-indicator--size-${size}`,
      `openforms-loading-indicator--color-${color}`,
      disableAnimation && 'openforms-loading-indicator--no-animation'
    )}
    role="status"
  >
    <span className="openforms-loading-indicator__spinner" />
    <span className="sr-only">
      {description || (
        <FormattedMessage description="Loading content text" defaultMessage="Loading..." />
      )}
    </span>
  </div>
);

export default LoadingIndicator;
