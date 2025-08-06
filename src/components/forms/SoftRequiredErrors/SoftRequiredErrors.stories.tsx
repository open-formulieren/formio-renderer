import type {
  SoftRequiredErrorsComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import {StoryObj} from '@storybook/react-vite';
import '@utrecht/components/paragraph';
import {expect, fn, within} from 'storybook/test';

import {renderMultipleComponentsInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import SoftRequiredErrors from './SoftRequiredErrors';

export default {
  title: 'Internal API / Forms / SoftRequiredErrors',
  component: SoftRequiredErrors,
  render: renderMultipleComponentsInForm,
  decorators: [withFormik],
  parameters: {
    formik: {
      initialValues: {
        textfield: '',
      },
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
      } satisfies TextFieldComponentSchema,
      {
        id: 'softRequiredErrors',
        type: 'softRequiredErrors',
        key: 'softRequiredErrors',
        label: 'softRequiredErrors',
        html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
      } satisfies SoftRequiredErrorsComponentSchema,
    ],
  },
};

type Story = StoryObj<typeof renderMultipleComponentsInForm>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Not all required fields are filled out. That can get expensive!');
    const list = await canvas.findByRole('list', {name: 'Empty fields'});
    const listItem = within(list).getByRole('listitem');

    expect(listItem.textContent).toEqual('Soft required text');
  },
};
