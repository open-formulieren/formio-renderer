import {ValidationError} from '@lib/validation';
import clsx from 'clsx';
import React from 'react';

export interface IErrorsProps {
  componentId: string;
  errors: ValidationError[];
}

/**
 * Reusable component showing `errors` as list of error messages for the component.
 */
export const Errors: React.FC<IErrorsProps> = ({componentId, errors}) => {
  const className = clsx(`of-error-list`);
  const listItemClassName = clsx(`of-error-list__item`);
  const labelClassName = clsx(`of-error-list__message`);

  return (
    <ul className={className} aria-describedby={componentId}>
      {errors?.map((error, index: number) => {
        return (
          <li key={index} className={listItemClassName}>
            <label className={labelClassName} htmlFor={componentId} role="alert">
              {error.message}
            </label>
          </li>
        );
      })}
    </ul>
  );
};
