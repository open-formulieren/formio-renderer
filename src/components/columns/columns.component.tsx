import { OF_PREFIX } from '@lib/constants'
import { CallbackConfiguration, Column, ComponentProps, RenderConfiguration } from '@types'
import classNames from 'classnames'
import React from 'react'

/**
 * Can be used to layout form across multiple columns.
 * @param component
 * @param children
 * @param renderConfiguration
 * @param components
 * @param callbacks
 * @param props
 * @constructor
 */
export const Columns = ({
  component,
  children,
  renderConfiguration,
  components,
  callbacks,
  ...props
}: ComponentProps) => {
  const className = `${OF_PREFIX}-columns`

  return (
    <div className={className} {...props}>
      {component.columns.map((column: Column, index: number) => (
        <NestedColumn
          key={`${component.id}-c${index}`}
          column={column}
          renderConfiguration={renderConfiguration}
          callbacks={callbacks}
        ></NestedColumn>
      ))}
    </div>
  )
}

/**
 * An individual column rendered by <Columns/>
 * @param column
 * @param renderConfiguration
 * @constructor
 */
export const NestedColumn = ({
  column,
  renderConfiguration,
  callbacks
}: {
  column: Column
  renderConfiguration: RenderConfiguration
  callbacks: CallbackConfiguration
}) => {
  const className = classNames({
    [`${OF_PREFIX}-column`]: true,
    [`${OF_PREFIX}-column--span-${column.width}`]: column.width,
    [`${OF_PREFIX}-column--span-mobile-${column.sizeMobile}`]: column.sizeMobile
  })
  const children = renderConfiguration.renderer.renderBranch({
    components: column.components,
    renderConfiguration,
    callbacks
  })
  return <div className={className}>{children}</div>
}
