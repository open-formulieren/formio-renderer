import { IComponentProps } from '@types'
import clsx from 'clsx'
import { ComponentSchema } from 'formiojs'
import React from 'react'

interface IContentComponent extends ComponentSchema {
  html: string
  type: 'content'
}

interface IContentProps extends IComponentProps {
  component: IContentComponent
}

/**
 * A Content component may be added to a form to provide non-field information. For example, if you
 * need instructions at the top of a form that are for display only, use the Content component. The
 * Content component value is not submitted back to the server.
 * WARNING: HTML is passed into dangerouslySetInnerHTML prop.
 */
export const Content = (contentProps: IContentProps): React.ReactElement => {
  const { component, children } = contentProps
  const className = clsx(`of-${contentProps.component.type}`)

  return (
    <div className={className}>
      <div dangerouslySetInnerHTML={{ __html: component?.html }} />
      {children}
    </div>
  )
}
