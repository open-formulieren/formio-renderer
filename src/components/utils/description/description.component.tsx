import clsx from 'clsx';
import React from 'react';

interface IDescriptionProps {
  description: string;
}

/**
 * Description/help text section of a component.
 */
export const Description: React.FC<IDescriptionProps> = ({description}) => {
  const className = clsx(`of-description`);
  return <div className={className}>{description}</div>;
};
