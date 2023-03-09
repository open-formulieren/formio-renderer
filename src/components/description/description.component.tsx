import { IComponentProps } from '@types'
import clsx from 'clsx'
import React from 'react'

/**
 * Description/help text section of a component.
 */
export const Description = (componentProps: IComponentProps): React.ReactElement | null => {
  const { component } = componentProps
  const className = clsx(`of-${componentProps.component.type}__description`)
  const innerHtml = component.description

  if (!innerHtml) {
    return null
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: innerHtml }} />
}
