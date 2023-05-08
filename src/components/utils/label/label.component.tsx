import clsx from 'clsx';
import React from 'react';

interface ILabelProps {
  componentId: string;
  label: string;
}

/**
 * Label component.
 */
export const Label: React.FC<ILabelProps> = ({componentId, label}) => {
  const className = clsx();

  return (
    <label className={className} htmlFor={componentId}>
      {label}
    </label>
  );
};
