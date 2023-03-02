import { useHTMLRef } from '@hooks'
import { gettext, OF_PREFIX } from '@lib'
import { ComponentProps } from '@types'
import classNames from 'classnames'
import React, { useState } from 'react'

/**
 * Textfield component.
 * @constructor
 */
export const TextField = ({
  callbacks,
  children,
  component,
  formErrors,
  errors,
  renderConfiguration,
  components,
  ...props
}: ComponentProps) => {
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
      'has-error': errors.length,
      'has-message': errors.length
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
      <label className={labelClassName} htmlFor={inputAttrs.id}>
        {gettext(component.label, renderConfiguration.i18n)}&nbsp;
      </label>

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
          <span className='charcount'>
            {gettext('{{ count }} characters', renderConfiguration.i18n, { count: charCountState })}
          </span>
        )}
      </div>

      <div className='openforms-help-text'>
        {gettext(component.description, renderConfiguration.i18n)}
      </div>

      <div
        aria-describedby={component.id}
        role='alert'
        className={errorsClassName}
        ref={messageContainerRef}
      >
        {errors.map((error: string, index: number) => {
          return (
            <React.Fragment key={error}>
              {index > 0 && <br />}
              {gettext(error, renderConfiguration.i18n)}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
