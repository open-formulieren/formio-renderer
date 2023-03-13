import { Component } from '@components'
import { FORMIO_EXAMPLE } from '@fixtures'
import { Meta } from '@storybook/react'
import { IComponentProps } from '@types'
import React from 'react'

export default {
  component: Component,
  title: 'Components / Reusable / Component'
} as Meta

export const Basic = (args: IComponentProps) => <Component {...args} />
Basic.args = {
  component: FORMIO_EXAMPLE[0],
  children: 'The quick brown fox jumps over the lazy dog.'
} as IComponentProps
