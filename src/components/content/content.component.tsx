import { IComponentProps, IFormioComponent } from '@types'
import clsx from 'clsx'
import React from 'react'

interface IContent extends IFormioComponent {
  type: 'content'
  html: string
}

interface IContentProps extends IComponentProps {
  component: IContent
}

/**
 * A Content component may be added to a form to provide non-field information. For example, if you
 * need instructions at the top of a form that are for display only, use the Content component. The
 * Content component value is not submitted back to the server.
 * WARNING: HTML is passed into dangerouslySetInnerHTML prop.
 */
export const Content = (contentProps: IContentProps): React.ReactElement => {
  const { component, children, ...props } = contentProps
  const className = clsx(`of-${contentProps.component.type}`)

  return (
    <div className={className} {...props}>
      <div dangerouslySetInnerHTML={{ __html: component?.html }} />
      {children}
    </div>
  )
}
