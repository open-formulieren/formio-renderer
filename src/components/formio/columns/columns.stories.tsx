import {Columns} from '@components';
import {RenderComponent} from '@lib/renderer';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';

import {FormikDecorator} from '../../../tests/utils/decorators';

const meta: Meta<typeof Columns> = {
  title: 'Components / Formio / Columns',
  component: Columns,
  decorators: [],
  parameters: {},
};
export default meta;

export const columns: ComponentStory<typeof RenderComponent> = args => (
  <RenderComponent {...args} />
);
columns.args = {
  component: {
    key: 'foo',
    type: 'columns',
    columns: [
      {
        key: 'foo.foo',
        type: 'column',
        size: 9,
        components: [{key: 'foo.foo.foo', type: 'content', html: 'Left column.'}],
      },
      {
        key: 'foo.bar',
        type: 'column',
        size: 3,
        components: [{key: 'foo.bar.bar', type: 'content', html: 'Right column.'}],
      },
    ],
  },
};
columns.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  expect(await canvas.findByText('Left column.')).toBeVisible();
  expect(await canvas.findByText('Right column.')).toBeVisible();
};
columns.decorators = [FormikDecorator];
