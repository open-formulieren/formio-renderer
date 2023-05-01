import {IComponentProps} from '@types';
import clsx from 'clsx';
import {ComponentSchema} from 'formiojs';
import React from 'react';

export interface IButtonComponent extends ComponentSchema {
  action: string;
  theme: string;
  type: 'button';
}

export interface IButtonProps extends IComponentProps {
  component: IButtonComponent;
}

/**
 * Buttons can be added to perform various actions within the form. The most obvious function of the
 * Button component is the Submission action.
 * TODO: Implement non submit/reset actions?
 */
export const Button = (buttonProps: IButtonProps): React.ReactElement => {
  const {component} = buttonProps;
  const {action, label, theme = 'primary'} = component;
  const className = clsx(
    `of-${buttonProps.component.type}`,
    `of-${buttonProps.component.type}--${theme}`
  );

  const type = ['submit', 'reset'].includes(action) ? (action as 'submit' | 'reset') : 'button';

  return (
    <button className={className} type={type}>
      {label}
    </button>
  );
};
