import clsx from 'clsx';
import React from 'react';

/**
 * Structural wrapper for the component. A component's implementation should be placed in `children`
 * prop.
 */
export const Component: React.FC<React.PropsWithChildren> = ({children}) => {
  const className = clsx(`of-component`);
  return <div className={className}>{children}</div>;
};
