import { useHTMLRef } from '@hooks'
import { OF_PREFIX } from '@lib/constants'
import { ComponentProps } from '@types'
import classNames from 'classnames'
import React, { useState } from 'react'

/**
 * Textfield component.
 * @constructor
 */
export const TextField = ({
  component,
  children,
  renderConfiguration,
  components,
  callbacks,
  ...props
}: ComponentProps) => {
  // {"label":"Text Field","prefix":"","suffix":""," "hideLabel":false,"description":"Lorem ipsum dolor sit amet","defaultValue":"Standaardwaarde","labelPosition":"top","showCharCount":true,"showWordCount":false,"customDefaultValue":""}
  const [pristineState, setPristineState] = useState<boolean>(true)
  const [charCountState, setCharCountState] = useState<number>(
    String(component.defaultValue).length
  )

  const componentRef = useHTMLRef<HTMLDivElement>('component')
  const elementRef = useHTMLRef<HTMLDivElement>('element')
  const inputRef = useHTMLRef<HTMLDivElement>('input')
  const messageContainerRef = useHTMLRef<HTMLDivElement>('messageContainer')

  const containerClassName = classNames(
    `${OF_PREFIX}-form-control`,
    `${OF_PREFIX}-form-control--textfield`,
    `${OF_PREFIX}-form-control--${component.key}`,
    {
      [`${OF_PREFIX}-form-control--required`]: component.required
    },
    `utrecht-form-field`,
    {
      'formio-modified': !pristineState,
      'has-error': true,
      'has-message': true
    },
    component.customClass
  )

  const labelClassName = classNames(`utrecht-form-label`, `openforms-label`, {
    [`field-required`]: component.validate?.required,
    [`required-field`]: component.validate?.required,
    [`utrecht-form-label--required`]: component.validate?.required
  })

  const inputClassName = classNames(
    `openforms-input`,
    `utrecht-textbox`,
    `utrecht-textbox--html-input`
  )

  const errorsClassName = classNames(
    `utrecht-form-field-description`,
    `utrecht-form-field-description--invalid`,
    `utrecht-form-field-description--openforms-errors`
  )

  const inputAttrs = {
    autoFocus: component.autofocus,
    disabled: component.disabled,
    id: `component.id-${component.key}`,
    minLength: component.minLength,
    maxLength: component.maxLength,
    multiple: component.multiple,
    name: `data[${component.key}`,
    pattern: component.validate?.pattern || undefined,
    placeholder: component.placeholder || component.mask || component.inputMask || undefined,
    required: component.validate?.required,
    spellCheck: component.spellcheck,
    tabIndex: component.tabindex || undefined,
    title: component.tooltip || undefined,
    ...component.widget, // TODO: Check if component.hidden should be used manually or even component.inputType.
    ...component.attributes
  }

  /**
   * @param {React.FormEvent} event
   */
  const onInput = (event: React.FormEvent<HTMLInputElement>) => {
    setCharCountState(event.currentTarget.value.length)
    setPristineState(false)
  }

  return (
    <div className={containerClassName} id={component.id} ref={componentRef} {...props}>
      <label className={labelClassName} htmlFor={inputAttrs.id}></label>

      <div ref={elementRef}>
        <input
          className={inputClassName}
          {...inputAttrs}
          defaultValue={component.defaultValue}
          ref={inputRef}
          onInput={onInput}
          {...callbacks}
        />
        {component.showCharCount && !pristineState && (
          <span className='charcount'>{charCountState} karakters</span>
        )}
      </div>

      <div className='openforms-help-text'>{component.description}</div>

      {/* NOT IMPLEMENTED */}
      <div
        aria-describedby={component.id}
        role='alert'
        className={errorsClassName}
        ref={messageContainerRef}
      >
        Error message
      </div>
    </div>
  )
}
