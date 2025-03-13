import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';
import {Paragraph} from '@utrecht/component-library-react';

import {TextField} from '@/components/forms';

import {EditGridItem} from '.';

export default {
  title: 'Internal API / Forms / EditGrid / EditGridItem',
  component: EditGridItem,
  decorators: [
    Story => (
      <div className="openforms-editgrid">
        <Story />
      </div>
    ),
  ],
  args: {
    children: <Paragraph>Any body content, typically a summary or form fields.</Paragraph>,
    heading: 'A heading for the item',
    canEdit: undefined,
    saveLabel: undefined,
    onReplace: fn(),
    canRemove: undefined,
    removeLabel: undefined,
    onRemove: fn(),
  },
  argTypes: {
    children: {control: false},
  },
} satisfies Meta<typeof EditGridItem>;

type Story = StoryObj<typeof EditGridItem>;

export const WithHeading: Story = {};

export const WithoutHeading: Story = {
  args: {
    heading: undefined,
  },
};

export const CanRemove: Story = {
  args: {
    canRemove: true,
  },
};

export const IsolatedMode: Story = {
  args: {
    enableIsolation: true,
    data: {
      topLevelKey: 'initial',
    },
    canEdit: true,
    canRemove: false,
    children: <TextField name="topLevelKey" label="Top level key" />,
  },

  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const textfield = canvas.getByLabelText('Top level key');
    await userEvent.clear(textfield);
    await userEvent.type(textfield, 'updated value');
    expect(textfield).toHaveDisplayValue('updated value');

    await userEvent.click(canvas.getByRole('button', {name: 'Save'}));
    expect(args.onReplace).toHaveBeenCalledWith({topLevelKey: 'updated value'});
  },
};

export const IsolatedModeCanRemove: Story = {
  args: {
    enableIsolation: true,
    data: {
      topLevelKey: 'initial',
    },
    canEdit: true,
    canRemove: true,
    children: <TextField name="topLevelKey" label="Top level key" />,
  },
};
