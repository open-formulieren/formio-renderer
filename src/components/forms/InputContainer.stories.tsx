import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';

import InputContainer from './InputContainer';

const InputContainerDecorator: Decorator = Story => (
  <>
    <label id="labelId" htmlFor="inputId">
      Field label
    </label>
    <Story />
  </>
);

export default {
  title: 'Internal API / Forms / InputContainer',
  component: InputContainer,
  args: {
    inputId: 'inputId',
    labelId: 'labelId',
    prefix: 'CO<sub>2</sub>',
    suffix: 'm<sup>2</sup>',
    renderInput: ariaLabelledBy => (
      <input
        id="inputId"
        type="text"
        placeholder="This is example input"
        aria-labelledby={ariaLabelledBy}
      />
    ),
  },
  decorators: [InputContainerDecorator],
} satisfies Meta<typeof InputContainer>;

type Story = StoryObj<typeof InputContainer>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox');
    // The accessible name for this field is the label + prefix + suffix
    expect(input).toHaveAccessibleName('Field label CO2 m2');
  },
};
