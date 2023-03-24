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
 * NOT IMPLEMENTED
 */
export const Errors = (errorProps: IErrorsProps): React.ReactElement | null => {
  const {errors, pristine, component} = errorProps;
  const className = clsx(`of-${errorProps.component.type}__errors`);

  if (pristine || !(errors || []).length) {
    return null;
  }

  return (
    <div className={className} aria-describedby={component.id} role="alert">
      {errors?.map((error: string, index: number) => {
        return (
          <React.Fragment key={error}>
            {index > 0 && <br />}
            {error}
          </React.Fragment>
        );
      })}
    </div>
  );
};
