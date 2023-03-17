import { IComponentProps } from '@types'
import clsx from 'clsx'
import React from 'react'

/**
 * Description/help text section of a component.
 * Takes `IComponentProps` an shows the given description.
 */
export const Description = (componentProps: IComponentProps): React.ReactElement | null => {
  const { component } = componentProps
  const className = clsx(`of-${componentProps.component.type}__description`)
  const description = component.description

  if (!description) {
    return null
  }

  return <div className={className}>{description}</div>
}
