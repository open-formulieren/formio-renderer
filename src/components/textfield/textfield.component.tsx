import { CharCount, Component, Description, Errors, Label } from '@components'
import { IComponentProps } from '@types'
import clsx from 'clsx'
import React, { useState } from 'react'

/**
 * A Text Field can be used for short and general text input. There are options to define input
 * masks and validations, allowing users to mold information into desired formats.
 * @param {IComponentProps} componentProps
 * @return {React.ReactElement}
 */
export const TextField = (componentProps: IComponentProps): React.ReactElement => {
  const { component, children, ...props } = componentProps
  const [pristineState, setPristineState] = useState<boolean>(true)
  const [charCountState, setCharCountState] = useState<number>(
    String(component.defaultValue).length
  )

  const inputClassName = clsx(`of-${componentProps.component.type}`)

  const inputAttrs = {
    disabled: component.disabled,
    id: component.key,
    minLength: component.minLength,
    maxLength: component.maxLength,
    multiple: component.multiple,
    name: `data[${component.key}`,
    pattern: component.validate?.pattern || undefined,
    placeholder: component.placeholder || component.mask || component.inputMask || undefined,
    required: component.validate?.required,
    ...component.widget // TODO: Check if component.hidden should be used manually or even component.inputType.
  }

  /**
   * @param {React.FormEvent} event
   */
  const onInput = (event: React.FormEvent<HTMLInputElement>) => {
    setCharCountState(event.currentTarget.value.length)
    setPristineState(false)
  }

  return (
    <Component {...componentProps}>
      <Label {...componentProps} htmlFor={inputAttrs.id} />

      <input
        className={inputClassName}
        defaultValue={component.defaultValue}
        onInput={onInput}
        {...inputAttrs}
        {...props}
      />

      <CharCount count={charCountState} pristine={pristineState} {...componentProps} />
      <Description {...componentProps} />
      <Errors {...componentProps} />
    </Component>
  )
}
