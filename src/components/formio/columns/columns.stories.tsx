import {Columns, IColumnsComponent, IContentComponent} from '@components';
import {IRenderComponentProps, RenderComponent} from '@lib/renderer';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';
import {Formik} from 'formik';
import React from 'react';

const meta: Meta<typeof Columns> = {
  title: 'Components / Formio / Columns',
  component: Columns,
  decorators: [],
  parameters: {},
};
export default meta;

export const columns: ComponentStory<React.FC<IRenderComponentProps<IColumnsComponent>>> = args => (
  <RenderComponent {...args} />
);
columns.args = {
  component: {
    key: undefined,
    type: 'columns',
    columns: [
      {
        size: 9,
        components: [{type: 'content', html: 'Left column.'} as IContentComponent],
      },
      {
        size: 3,
        components: [{type: 'content', html: 'Right column.'} as IContentComponent],
      },
    ],
  },
};
columns.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  expect(canvas.getByText('Left column.')).toBeTruthy();
  expect(canvas.getByText('Right column.')).toBeTruthy();
};
columns.decorators = [
  Story => (
    <Formik initialValues={{columns: null}} onSubmit={() => {}}>
      {Story()}
    </Formik>
  ),
];
