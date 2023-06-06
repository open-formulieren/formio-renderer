import {CharCount, Component, Description, Errors, Label} from '@components/utils';
import {IComponentProps} from '@types';
import clsx from 'clsx';
import {ComponentSchema} from 'formiojs';
import React, {useState} from 'react';

export interface ITextFieldComponent extends ComponentSchema {
  id: string;
  inputMask: string;
  key: string;
  label: string;
  mask: string;
  showCharCount: boolean;
  type: 'textfield';
}

// TODO: replace with @open-formulieren/open-forms-types TextFieldSchema type when its available
export interface ITextFieldProps extends IComponentProps {
  component: ITextFieldComponent;
  value: string;
}

/**
 * A Text Field can be used for short and general text input. There are options to define input
 * masks and validations, allowing users to mold information into desired formats.
 */
export const TextField: React.FC<ITextFieldProps> = ({callbacks, component, value, errors}) => {
  const {onChange, ..._callbacks} = callbacks;
  const [pristineState, setPristineState] = useState<boolean>(true);
  const inputClassName = clsx(`of-${component.type}`);
  const componentId = `${component.id}-${component.key}`;

  const inputAttrs = {
    disabled: component.disabled,
    id: componentId,
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
    setPristineState(false);
    onChange && onChange(event);
  };

  return (
    <Component>
      <Label componentId={componentId} label={component.label} />

      <input
        className={inputClassName}
        value={onChange ? value || '' : undefined}
        defaultValue={!onChange ? value || '' : undefined}
        onChange={_onChange}
        {...inputAttrs}
        {..._callbacks}
      />

      {!pristineState && component.showCharCount && value && <CharCount value={value} />}
      {component.description && <Description description={component.description} />}
      {!pristineState && errors?.length > 0 && <Errors componentId={componentId} errors={errors} />}
    </Component>
  );
};
