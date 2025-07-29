import {Meta, StoryObj} from '@storybook/react-vite';
import {FormLabel, Textbox} from '@utrecht/component-library-react';
import {expect, within} from 'storybook/test';

import '@/components/forms/TextField/TextField.scss';

import {InputGroup, InputGroupItem} from '.';
import {InputGroupProps} from './InputGroup';

interface StoryArgs extends InputGroupProps {
  labels: string[];
}

const render = ({labels, ...args}: StoryArgs) => (
  <InputGroup {...args}>
    {labels.map((label, index) => (
      <InputGroupItem key={`${label}-${index}`}>
        <FormLabel className="openforms-input-group__label" htmlFor={`input-${index}`}>
          {label}
        </FormLabel>
        <Textbox type="text" name={`input-${index}`} id={`input-${index}`} />
      </InputGroupItem>
    ))}
  </InputGroup>
);

export default {
  title: 'Internal API / Forms / Input group',
  args: {
    label: 'Input group',
    labels: ['Input 1', 'Input 2', 'Input 3'],
    isRequired: true,
    isDisabled: false,
    isInvalid: false,
  },
  argTypes: {
    children: {table: {disable: true}},
  },
  render,
} satisfies Meta<StoryArgs>;

type Story = StoryObj<StoryArgs>;

export const Default: Story = {};

export const WithTooltip: Story = {
  args: {
    tooltip: 'Example short tooltip.',
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
};

export const Invalid: Story = {
  args: {
    isInvalid: true,
  },
};

export const WithValidationErrorAndTooltip: Story = {
  ...Invalid,
  args: {
    ...Invalid.args,
    tooltip: 'Tooltip content.',
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const fieldset = canvas.getByRole('group', {name: /^Input group/});
    expect(fieldset).toHaveAccessibleDescription('');
  },
};
