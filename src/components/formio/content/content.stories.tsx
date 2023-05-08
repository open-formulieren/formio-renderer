import {Content, IContentComponent} from '@components';
import {IRenderComponentProps, RenderComponent} from '@lib/renderer';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';
import {Formik} from 'formik';
import React from 'react';

const meta: Meta<typeof Content> = {
  title: 'Components / Formio / Content',
  component: Content,
  decorators: [],
  parameters: {},
};
export default meta;

export const content: ComponentStory<React.FC<IRenderComponentProps<IContentComponent>>> = args => (
  <RenderComponent {...args} />
);
content.args = {
  component: {
    type: 'content',
    html: 'The <b>quick</b> brown fox jumps over the lazy dog.',
  },
};
content.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  expect(canvas.getByText('quick')).toBeTruthy();
};
content.decorators = [
  Story => (
    <Formik initialValues={{content: null}} onSubmit={() => {}}>
      {Story()}
    </Formik>
  ),
];
