import { useHTMLRef } from '@hooks'
import { OF_PREFIX } from '@lib'
import { ComponentProps } from '@types'
import classNames from 'classnames'
import React from 'react'

/**
 * Can be used to display arbitrary (HTML) content.
 * HTML is passed into dangerouslySetInnerHTML prop.
 * @constructor
 */
export const Content = ({
  component,
  children,
  components,
  formErrors,
  renderConfiguration,
  ...props
}: ComponentProps) => {
  const className = classNames({
    [`${OF_PREFIX}-form-control`]: true,
    [`${OF_PREFIX}-form-control--content`]: true,
    [`${OF_PREFIX}-form-control--content`]: true,
    [`formio-component-content`]: true,
    [`utrecht-form-field`]: true
  })
  const htmlRef = useHTMLRef<HTMLDivElement>('html')

  return (
    <div className={className} {...props}>
      <div ref={htmlRef} dangerouslySetInnerHTML={{ __html: component.html }} />
      {children}
    </div>
  )
}
