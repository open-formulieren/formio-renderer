import { IComponentProps } from '@types'
import clsx from 'clsx'
import React from 'react'

/**
 * Errors section of a component.
 */
export const Errors = (componentProps: IComponentProps): React.ReactElement | null => {
  const { component, errors } = componentProps
  const className = clsx(`of-${componentProps.component.type}__errors`)

  if (!(errors || []).length) {
    return null
  }

  return (
    <div className={className} aria-describedby={component.id} role='alert'>
      {errors?.map((error: string, index: number) => {
        return (
          <React.Fragment key={error}>
            {index > 0 && <br />}
            {error}
          </React.Fragment>
        )
      })}
    </div>
  )
}
