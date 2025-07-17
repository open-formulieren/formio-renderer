import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, waitFor, within} from '@storybook/test';
import '@utrecht/components/paragraph';

import {renderMultipleComponentsInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioSoftRequiredErrors as SoftRequiredErrors} from './';

export default {
  title: 'Component registry / special / SoftRequiredErrors',
  component: SoftRequiredErrors,
  decorators: [withFormik],
  render: renderMultipleComponentsInForm,
  parameters: {
    formik: {
      disable: true,
    },
  },
  args: {
    onSubmit: fn(),
    componentDefinitions: [
      {
        type: 'textfield',
        key: 'textfield',
        label: 'Soft required text',
        // @ts-ignore
        openForms: {softRequired: true},
      },
      {
        id: 'gello',
        type: 'softRequiredErrors',
        key: 'softRequiredErrors',
        label: 'softRequiredErrors',
        html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
      },
    ],
  },
} satisfies Meta<typeof renderMultipleComponentsInForm>;

type Story = StoryObj<typeof renderMultipleComponentsInForm>;

export const Default: Story = {
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const ERROR_TEXT = 'Not all required fields are filled out. That can get expensive!';

    await step('Initial state', async () => {
      expect(await canvas.findByText(ERROR_TEXT)).toBeVisible();
      const list = await canvas.findByRole('list', {name: 'Empty fields'});
      const listItems = within(list).getAllByRole('listitem');
      expect(listItems).toHaveLength(1);
    });

    await step('Fill out field and remove error', async () => {
      const input = canvas.getByLabelText('Soft required text');
      await userEvent.type(input, 'Not empty');
      await waitFor(() => {
        expect(canvas.queryByText(ERROR_TEXT)).toBeNull();
      });
    });

    // Added value of this step: the chromatic snapshot should capture the missing fields
    await step('Return error when field becomes empty again', async () => {
      const input = canvas.getByLabelText('Soft required text');
      await userEvent.clear(input);
      input.blur();

      expect(await canvas.findByText(ERROR_TEXT)).toBeVisible();
      const list = await canvas.findByRole('list', {name: 'Empty fields'});
      const listItems = within(list).getAllByRole('listitem');
      expect(listItems).toHaveLength(1);
    });
  },
};
