import { Column, Columns, IColumnsProps } from '@components'
import { FORMIO_COLUMNS } from '@fixtures'
import { Meta } from '@storybook/react'
import React from 'react'

export default {
  component: Columns,
  title: 'Components / Columns'
} as Meta

export const Basic = (args: IColumnsProps) => (
  <Columns {...args}>
    <Column component={{ ...FORMIO_COLUMNS.columns[0], type: 'column' }} errors={[]}>
      The quick brown fox jumps over the lazy dog.
    </Column>
    <Column component={{ ...FORMIO_COLUMNS.columns[0], type: 'column' }} errors={[]}>
      The quick brown fox jumps over the lazy dog.
    </Column>
  </Columns>
)
Basic.args = {
  component: {
    type: 'columns'
  }
}
