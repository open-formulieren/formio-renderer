import {ITextFieldComponent, TextField} from '@components';
import {IRenderComponentProps, RenderComponent} from '@lib/renderer';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import {Formik} from 'formik';
import React from 'react';

const meta: Meta<typeof TextField> = {
  title: 'Components / Formio / Textfield',
  component: TextField,
  decorators: [],
  parameters: {},
};
export default meta;

export const textfield: ComponentStory<
  React.FC<IRenderComponentProps<ITextFieldComponent>>
> = args => <RenderComponent {...args} />;
textfield.args = {
  component: {
    description: 'Enter your first name',
    id: 'id',
    inputMask: '',
    key: 'firstName',
    label: 'first name',
    mask: '',
    showCharCount: true,
    type: 'textfield',
  },
};
textfield.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = canvas.getByLabelText('first name');
  expect(canvas.getByText('Enter your first name')).toBeTruthy();
  expect(canvas.queryByText('0 characters')).toBeNull();
  await userEvent.type(input, 'The quick brown fox jumps over the lazy dog.', {delay: 10});
  expect(canvas.queryByText('44 characters')).toBeTruthy();
};
textfield.decorators = [
  Story => (
    <Formik initialValues={{firstName: null}} onSubmit={() => {}}>
      {Story()}
    </Formik>
  ),
];
