import { IComponentProps } from '@types'
import clsx from 'clsx'
import React from 'react'

/**
 * Wrapper for various parts of the component.
 * @param {IComponentProps} componentProps
 * @return {React.ReactElement}
 */
export const Component = (componentProps: IComponentProps): React.ReactElement => {
  const className = clsx(`of-${componentProps.component.type}`)
  return <div className={className}>{componentProps.children}</div>
}
