import type {Meta, StoryObj} from '@storybook/react-vite';
import {FormLabel} from '@utrecht/form-label-react';
import {Textbox} from '@utrecht/textbox-react';
import {expect, within} from 'storybook/test';

import '@/components/forms/TextField/TextField.scss';

import {InputGroup, InputGroupItem} from '.';
import type {InputGroupProps} from './InputGroup';

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
        <Textbox
          type="text"
          name={`input-${index}`}
          id={`input-${index}`}
          readOnly={args.isReadOnly}
        />
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
    isReadOnly: false,
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
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const fieldset = canvas.getByRole('group', {name: /^Input group/});
    expect(fieldset).toHaveAccessibleDescription('');
  },
};

export const WithFAQItems: Story = {
  args: {
    faqItems: [
      {
        label: 'How do I fill in this field?',
        content: 'The values required to fill out this field can be retrieved from XYZ.',
      },
      {
        label: 'Is this field applicable to me?',
        content: 'This field is applicable if you are XYZ.',
      },
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const faqLabels1 = canvas.getAllByText('How do I fill in this field?');
    const faqLabels2 = canvas.getAllByText('Is this field applicable to me?');

    await expect(faqLabels1).toHaveLength(2);
    // Label should be visible underneath the fields
    await expect(faqLabels1[1]).toBeVisible();

    await expect(faqLabels2).toHaveLength(2);
    // Label should be visible underneath the fields
    await expect(faqLabels2[1]).toBeVisible();
  },
};

export const ReadOnly: Story = {
  args: {
    isReadOnly: true,
  },
};
