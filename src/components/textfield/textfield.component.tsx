import {CharCount, Component, Description, Errors, Label} from '@components';
import {IComponentProps} from '@types';
import clsx from 'clsx';
import {ComponentSchema} from 'formiojs';
import React, {useState} from 'react';

export interface ITextFieldComponent extends ComponentSchema {
  id: string;
  inputMask: string;
  mask: string;
  type: 'textfield';
}

export interface ITextFieldProps extends IComponentProps {
  component: ITextFieldComponent;
}

/**
 * A Text Field can be used for short and general text input. There are options to define input
 * masks and validations, allowing users to mold information into desired formats.
 */
export const TextField = (componentProps: ITextFieldProps): React.ReactElement => {
  const {children, component, value, callbacks = {}, ...props} = componentProps;
  const {onChange, ..._callbacks} = callbacks;
  const [pristineState, setPristineState] = useState<boolean>(true);
  const [charCountState, setCharCountState] = useState<number>(
    String(component.defaultValue).length
  );

  const inputClassName = clsx(`of-${componentProps.component.type}`);

  const inputAttrs = {
    disabled: component.disabled,
    id: component.key,
    minLength: component.validate?.minLength,
    maxLength: component.validate?.maxLength,
    multiple: component.multiple,
    name: component.key,
    pattern: component.validate?.pattern || undefined,
    placeholder: component.placeholder || component.mask || component.inputMask || undefined,
    required: component.validate?.required,
    ...component.widget, // TODO: Check if component.hidden should be used manually or even component.inputType.
  };

  /**
   * @param {React.FormEvent} event
   */
  const _onChange = (event: React.FormEvent<HTMLInputElement>) => {
    setCharCountState(event.currentTarget.value.length);
    setPristineState(false);
    onChange?.call(event.target, event);
  };

  return (
    <Component {...componentProps}>
      <Label {...componentProps} />
      <input
        className={inputClassName}
        value={onChange ? value || '' : undefined}
        defaultValue={!onChange ? value || '' : undefined}
        onChange={_onChange}
        {...inputAttrs}
        {..._callbacks}
        {...props}
      />
      <CharCount count={charCountState} pristine={pristineState} {...componentProps} />
      <Description {...componentProps} />
      <Errors {...componentProps} />
    </Component>
  );
};
