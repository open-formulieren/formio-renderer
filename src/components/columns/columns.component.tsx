import { OF_PREFIX } from '@lib'
import {
  CallbackConfiguration,
  Column,
  ComponentProps,
  FormErrors,
  RenderConfiguration
} from '@types'
import classNames from 'classnames'
import React from 'react'

/**
 * Can be used to layout form across multiple columns.
 * @param component
 * @param children
 * @param formErrors
 * @param renderConfiguration
 * @param components
 * @param callbacks
 * @param props
 * @constructor
 */
export const Columns = ({
  callbacks,
  children,
  component,
  components,
  formErrors,
  renderConfiguration,
  ...props
}: ComponentProps) => {
  const className = `${OF_PREFIX}-columns`

  return (
    <div className={className} {...props}>
      {component.columns.map((column: Column, index: number) => (
        <NestedColumn
          key={`${component.id}-c${index}`}
          callbacks={callbacks}
          column={column}
          formErrors={formErrors}
          renderConfiguration={renderConfiguration}
        ></NestedColumn>
      ))}
    </div>
  )
}

/**
 * An individual column rendered by <Columns/>
 * @param callbacks
 * @param column
 * @param formErrors
 * @param renderConfiguration
 * @constructor
 */
export const NestedColumn = ({
  callbacks,
  column,
  formErrors,
  renderConfiguration
}: {
  callbacks: CallbackConfiguration
  column: Column
  renderConfiguration: RenderConfiguration
  formErrors: FormErrors
}) => {
  const className = classNames({
    [`${OF_PREFIX}-column`]: true,
    [`${OF_PREFIX}-column--span-${column.width}`]: column.width,
    [`${OF_PREFIX}-column--span-mobile-${column.sizeMobile}`]: column.sizeMobile
  })
  const children = renderConfiguration.renderer.renderBranch({
    callbacks,
    components: column.components,
    renderConfiguration,
    formErrors
  })
  return <div className={className}>{children}</div>
}
