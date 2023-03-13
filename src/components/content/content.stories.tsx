import { Content, IContentProps } from '@components'
import { Meta } from '@storybook/react'
import React from 'react'

export default {
  component: Content,
  title: 'Components / Content'
} as Meta

export const Basic = (args: IContentProps) => <Content {...args}></Content>
Basic.args = {
  component: {
    type: 'content',
    html: 'The <strong>quick</strong> brown fox jumps over the lazy dog.'
  }
}
