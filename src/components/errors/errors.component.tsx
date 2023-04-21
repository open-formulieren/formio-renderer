import {IComponentProps} from '@types';
import clsx from 'clsx';
import {ComponentSchema} from 'formiojs';
import React from 'react';

interface IErrorsComponent extends ComponentSchema {
  id: string;
}

export interface IErrorsProps extends IComponentProps {
  component: IErrorsComponent;
  pristine: boolean;
}

/**
 * Reusable component showing `errors` as list of error messages for the component.
 * Error list  is only shown when `pristine=false` indicating that the component's initials state is
 * modified.
 */
export const Errors = (errorProps: IErrorsProps): React.ReactElement | null => {
  const {errors, pristine, component} = errorProps;
  const className = clsx(`of-${errorProps.component.type}__error-list`);
  const listItemClassName = clsx(`of-${errorProps.component.type}__error-list-item`);
  const labelClassName = clsx(`of-${errorProps.component.type}__error-message`);

  if (pristine || !(errors || []).length) {
    return null;
  }

  return (
    <ul className={className} aria-describedby={component.id}>
      {errors?.map((error: string) => {
        return (
          <li key={error} className={listItemClassName}>
            <label className={labelClassName} htmlFor={component.key} role="alert">
              {error}
            </label>
          </li>
        );
      })}
    </ul>
  );
};
