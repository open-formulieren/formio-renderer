import type {Meta, StoryObj} from '@storybook/react-vite';
import {Paragraph} from '@utrecht/component-library-react';
import {expect, userEvent, waitFor, within} from 'storybook/test';

import {withMockDate} from '@/sb-decorators';

import {DatePicker, DatePickerRoot, DatePickerTrigger} from './DatePicker';

export default {
  title: 'Internal API / Forms / DatePicker',
  component: DatePicker,
  decorators: [
    Story => {
      return (
        <>
          <DatePickerRoot>
            {({refs}) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  columnGap: '1em',
                }}
              >
                <p
                  ref={refs.setPositionReference}
                  style={{border: 'dashed 1px #ccc', padding: '1em'}}
                >
                  Reference for the the dialog
                </p>
                <DatePickerTrigger />
                <Story />
              </div>
            )}
          </DatePickerRoot>
        </>
      );
    },
    withMockDate,
  ],
  args: {
    children: null,
  },
  argTypes: {
    children: {table: {disable: true}},
  },
  parameters: {
    layout: 'centered',
    mockDate: new Date('2025-12-17T12:00:00+01:00'),
  },
} satisfies Meta<typeof DatePicker>;

type Story = StoryObj<typeof DatePicker>;

const waitForFocus = async (element: Element) => {
  await waitFor(() => {
    expect(element).toBeVisible();
    expect(element).toHaveFocus();
  });
};

export const WithoutChildren: Story = {
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();

    const trigger = canvas.getByRole('button', {name: 'Toggle calendar'});
    expect(trigger).toBeVisible();

    await step('clicking trigger opens dialog', async () => {
      await userEvent.click(trigger);
      const dialog = await canvas.findByRole('dialog');
      await waitForFocus(dialog);
      await userEvent.keyboard('{Escape}');
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await step('keyboard navigation opens dialog', async () => {
      trigger.focus();
      await userEvent.keyboard('{Enter}');
      const dialog = await canvas.findByRole('dialog');
      await waitForFocus(dialog);
    });
  },
};

export const WithChildren: Story = {
  args: {
    children: (
      <Paragraph style={{textAlign: 'center', padding: '12px'}}>An additional paragraph</Paragraph>
    ),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();

    const trigger = canvas.getByRole('button', {name: 'Toggle calendar'});
    expect(trigger).toBeVisible();
    await userEvent.click(trigger);
  },
};
