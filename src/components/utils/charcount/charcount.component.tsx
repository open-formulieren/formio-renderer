import clsx from 'clsx';
import React from 'react';

export interface ICharCountProps {
  value: string;
}

/**
 * Reusable component showing `count` as number of characters typed into the component.
 */
export const CharCount: React.FC<ICharCountProps> = ({value}) => {
  const className = clsx(`of-charcount`);
  return <span className={className}>{value.length} characters</span>;
};
