import { IComponentProps } from '@types'
import clsx from 'clsx'
import React from 'react'

/**
 * A Content component may be added to a form to provide non-field information. For example, if you
 * need instructions at the top of a form that are for display only, use the Content component. The
 * Content component value is not submitted back to the server.
 * WARNING: HTML is passed into dangerouslySetInnerHTML prop.
 * @param {IComponentProps} componentProps
 * @return {React.ReactElement}
 */
export const Content = (componentProps: IComponentProps): React.ReactElement => {
  const { component, children, ...props } = componentProps
  const className = clsx(`of-${componentProps.component.type}`)

  return (
    <div className={className} {...props}>
      <div dangerouslySetInnerHTML={{ __html: component?.html }} />
      {children}
    </div>
  )
}
