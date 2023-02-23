import { ComponentProps } from '@types'
import classNames from 'classnames'
import React from 'react'

/**
 * Can be used to display arbitrary (HTML) form.
 * HTML is passed into dangerouslySetInnerHTML prop.
 * @constructor
 */
export const Form = ({ children, callbacks, ...props }: ComponentProps) => {
  const className = classNames(`formio-form`)

  return (
    <form
      className={className}
      noValidate={true}
      rel='form'
      onSubmit={callbacks?.onSubmit}
      {...props}
    >
      {children}
      <input type='submit' />
    </form>
  )
}
