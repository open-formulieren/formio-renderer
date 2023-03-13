import { IComponentProps } from '@types'
import clsx from 'clsx'
import React from 'react'

export interface ICharCountProps extends IComponentProps {
  count: number

  pristine: boolean
}

/**
 * Reusable component showing `count` as number of characters typed into the component. Character
 * count is only shown when `pristine=false` indicating that the component's initials state is
 * modified
 */
export const CharCount = (charCountProps: ICharCountProps): React.ReactElement | null => {
  const { count, pristine } = charCountProps
  const className = clsx(`of-${charCountProps.component.type}__charcount`)

  if (pristine) {
    return null
  }

  return <span className={className}>{count} characters</span>
}
