import type {Meta, StoryObj} from '@storybook/react-vite';
import {Paragraph} from '@utrecht/component-library-react';
import '@utrecht/components/paragraph';
import {expect, fn, userEvent, within} from 'storybook/test';
import {z} from 'zod';

import {TextField} from '@/components/forms';

import {EditGridItem} from '.';

export default {
  title: 'Internal API / Forms / EditGrid / EditGridItem',
  component: EditGridItem,
  decorators: [
    Story => (
      <div className="openforms-editgrid">
        <ol className="openforms-editgrid__container">
          <Story />
        </ol>
      </div>
    ),
  ],
  args: {
    index: 0,
    getBody: () => <Paragraph>Any body content, typically a summary or form fields.</Paragraph>,
    heading: 'A heading for the item',
    canEdit: undefined,
    saveLabel: undefined,
    onChange: fn(),
    canRemove: undefined,
    removeLabel: undefined,
    onRemove: fn(),
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
    getBody: ({expanded}) =>
      expanded ? <TextField name="topLevelKey" label="Top level key" /> : 'A preview body',
  },

  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Edit item 1'}));

    const textfield = canvas.getByLabelText('Top level key');
    await userEvent.clear(textfield);
    await userEvent.type(textfield, 'updated value');
    expect(textfield).toHaveDisplayValue('updated value');

    await userEvent.click(canvas.getByRole('button', {name: 'Save'}));
    expect(args.onChange).toHaveBeenCalledWith({topLevelKey: 'updated value'});
  },
};

export const IsolatedModeCanRemove: Story = {
  args: {
    ...IsolatedMode.args,
    canRemove: true,
  },
};

export const IsolatedModeWithZodSchema: Story = {
  args: {
    ...IsolatedMode.args,
    enableIsolation: true,
    validationSchema: z.object({
      topLevelKey: z.string().max(5), // max 5 characters
    }),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Edit item 1'}));
    const inputField = await canvas.findByLabelText('Top level key');
    expect(inputField).toHaveDisplayValue('initial');
    await userEvent.click(inputField);
    await userEvent.tab();

    expect(await canvas.findByText('String must contain at most 5 character(s)')).toBeVisible();
  },
};
