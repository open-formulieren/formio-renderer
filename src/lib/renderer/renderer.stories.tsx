import {FORMIO_EXAMPLE} from '@fixtures';
import {DEFAULT_RENDER_CONFIGURATION, RenderComponent, RenderForm} from '@lib/renderer/renderer';
import type {ComponentStory, Meta} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import React from 'react';

const meta: Meta<typeof RenderForm> = {
  title: 'Libraries / Renderer',
  component: RenderForm,
  decorators: [],
  parameters: {},
};
export default meta;

//
// renderForm
//

export const renderForm: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args}>
    <button type="submit">Submit</button>
  </RenderForm>
);
renderForm.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: FORMIO_EXAMPLE,
  },
  initialValues: {
    [FORMIO_EXAMPLE[0].key as string]: 'foo',
  },
};
renderForm.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.clear(canvas.getByLabelText(FORMIO_EXAMPLE[0].label));
  await userEvent.type(canvas.getByLabelText(FORMIO_EXAMPLE[0].label), 'John');
  await userEvent.type(canvas.getByLabelText(FORMIO_EXAMPLE[1].label), 'Doe');
  await userEvent.click(canvas.getByText('Submit'));
};

//
// renderComponent
//

export const renderComponent: ComponentStory<typeof RenderComponent> = args => (
  <RenderComponent {...args}>
    <button type="submit">Submit</button>
  </RenderComponent>
);
renderComponent.args = {
  component: FORMIO_EXAMPLE[0],
};
renderComponent.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.clear(canvas.getByLabelText(FORMIO_EXAMPLE[0].label));
  await userEvent.type(canvas.getByLabelText(FORMIO_EXAMPLE[0].label), 'John');
};
