import type {ColumnsComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import FormioComponent from '@/components/FormioComponent';
import {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {Columns} from './';

export default {
  title: 'Component registry / layout / columns',
  component: Columns,
  decorators: [withFormik],
  args: {
    renderNested: FormioComponent,
  },
} satisfies Meta<typeof Columns>;

type Story = StoryObj<typeof Columns>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'columns',
      key: 'columns',
      columns: [
        {
          size: 6,
          sizeMobile: 4,
          components: [
            {
              id: 'component2',
              type: 'textfield',
              key: 'my.textfield',
              label: 'Textfield 1',
            },
          ],
        },
        {
          size: 6,
          sizeMobile: 4,
          components: [
            {
              id: 'component3',
              type: 'textfield',
              key: 'otherTextfield',
              label: 'Textfield 2',
            },
          ],
        },
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textfield: '',
        },
      },
    },
  },
};

export const MobileMinimalConfiguration: Story = {
  ...MinimalConfiguration,
  globals: {
    viewport: {value: 'mobile1', isRotated: false},
  },
};

interface ValidationStoryArgs {
  columns: ColumnsComponentSchema['columns'];
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: args =>
    renderComponentInForm({
      ...args,
      componentDefinition: {
        id: 'columns',
        key: 'columns',
        type: 'columns',
        columns: args.columns,
      },
    }),
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const ValidatesNestedComponents: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    columns: [
      {
        size: 6,
        sizeMobile: 4,
        components: [
          {
            id: 'textfield',
            key: 'textfield',
            type: 'textfield',
            label: 'A text field',
            defaultValue: 'ABC',
            validate: {
              maxLength: 3,
            },
          },
        ],
      },
      {
        size: 6,
        sizeMobile: 4,
        components: [
          {
            id: 'email',
            key: 'email',
            type: 'email',
            label: 'Email address',
            validateOn: 'blur',
            validate: {
              required: true,
            },
          },
        ],
      },
    ],
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A text field');
    expect(textField).toHaveDisplayValue('ABC');
    await userEvent.clear(textField);
    await userEvent.type(textField, 'too long');
    const emailField = canvas.getByLabelText('Email address');
    await userEvent.type(emailField, 'bad value');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    expect(await canvas.findByText('String must contain at most 3 character(s)')).toBeVisible();
    expect(await canvas.findByText('Invalid email')).toBeVisible();

    expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
