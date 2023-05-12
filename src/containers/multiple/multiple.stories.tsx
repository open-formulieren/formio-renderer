import {DEFAULT_RENDER_CONFIGURATION, RenderForm} from '@lib/renderer';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';

import {Multiple} from './multiple.container';

const meta: Meta<typeof Multiple> = {
  title: 'Containers / Multiple',
  component: Multiple,
  decorators: [],
  parameters: {},
};
export default meta;

export const multipleTextfields: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
multipleTextfields.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [
      {
        type: 'textfield',
        key: 'multiple-inputs',
        description: 'Array of strings instead of a single string value',
        label: 'Multiple inputs',
        multiple: true,
      },
    ],
  },
  initialValues: {
    'multiple-inputs': ['first value'],
  },
  onSubmit: () => {},
};
multipleTextfields.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);

  // check that new items can be added
  await userEvent.click(canvas.getByRole('button', {name: 'Add another'}));
  const input1 = await canvas.getAllByRole('textbox')[0];
  expect(input1).toHaveDisplayValue('first value');
  await userEvent.clear(input1);
  await userEvent.type(input1, 'Foo');
  expect(input1).toHaveDisplayValue('Foo');

  const input2 = await canvas.getAllByRole('textbox')[1];
  expect(input2).toHaveDisplayValue('');

  // the label & description should be rendered only once, even with > 1 inputs
  expect(canvas.queryAllByText('Multiple inputs')).toHaveLength(1);
  expect(canvas.queryAllByText('Array of strings instead of a single string value')).toHaveLength(
    1
  );

  // finally, it should be possible delete rows again
  const removeButtons = await canvas.findAllByRole('button', {name: 'Remove item'});
  expect(removeButtons).toHaveLength(2);
  await userEvent.click(removeButtons[0]);
  expect(await canvas.getAllByRole('textbox')[0]).toHaveDisplayValue('');
  expect(await canvas.getAllByRole('textbox')).toHaveLength(1);
};
