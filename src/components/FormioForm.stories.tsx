import {FieldsetComponentSchema, TextFieldComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import FormioForm from './FormioForm';

export default {
  title: 'Public API / FormioForm',
  component: FormioForm,
  args: {
    onSubmit: fn(),
    children: (
      <div style={{marginBlockStart: '20px'}}>
        <button type="submit">Submit</button>
      </div>
    ),
    requiredFieldsWithAsterisk: true,
  },
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
  },
  tags: ['unstable', '!private', 'public'],
} satisfies Meta<typeof FormioForm>;

type Story = StoryObj<typeof FormioForm>;

export const FlatLayout: Story = {
  args: {
    components: [
      {
        id: 'component1',
        type: 'textfield',
        key: 'nested.textfield',
        label: 'Text field 1',
      } satisfies TextFieldComponentSchema,
      {
        id: 'component2',
        type: 'textfield',
        key: 'topLevelTextfield',
        label: 'Text field 2',
        defaultValue: 'Default/initial value',
      } satisfies TextFieldComponentSchema,
    ],
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField1 = canvas.getByLabelText('Text field 1');
    expect(textField1).toHaveDisplayValue('');

    const textField2 = canvas.getByLabelText('Text field 2');
    expect(textField2).toHaveDisplayValue('Default/initial value');
  },
};

export const NestedLayout: Story = {
  args: {
    components: [
      {
        id: 'fieldset',
        type: 'fieldset',
        key: 'fieldset',
        label: 'Fielset',
        hideHeader: true,
        components: [
          {
            id: 'textfield',
            type: 'textfield',
            key: 'textfield',
            label: 'Nested text field',
            defaultValue: 'initial value',
          } satisfies TextFieldComponentSchema,
          {
            id: 'textfield-bis',
            type: 'textfield',
            key: 'nested.textfield',
            label: 'Second text field',
            defaultValue: 'nested value',
          } satisfies TextFieldComponentSchema,
        ],
      } satisfies FieldsetComponentSchema,
    ],
  },
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);

    await step('Form fields have initial values', () => {
      const textField = canvas.getByLabelText('Nested text field');
      expect(textField).toHaveDisplayValue('initial value');

      const nestedTextField = canvas.getByLabelText('Second text field');
      expect(nestedTextField).toHaveDisplayValue('nested value');
    });

    await step('Submitted data is correct', async () => {
      const submitButton = canvas.getByRole('button', {name: 'Submit'});
      await userEvent.click(submitButton);
      expect(args.onSubmit).toHaveBeenCalledWith({
        nested: {
          textfield: 'nested value',
        },
        textfield: 'initial value',
      });
    });
  },
};

export const AsterisksForRequiredFields: Story = {
  args: {
    components: [
      {
        id: 'component1',
        type: 'textfield',
        key: 'nested.textfield',
        label: 'Text field 1',
        validate: {required: true},
      } satisfies TextFieldComponentSchema,
    ],
    requiredFieldsWithAsterisk: true,
  },
};

export const NoAsterisksForRequiredFields: Story = {
  args: {
    components: [
      {
        id: 'component1',
        type: 'textfield',
        key: 'nested.textfield',
        label: 'Text field 1',
        validate: {required: true},
      } satisfies TextFieldComponentSchema,
    ],
    requiredFieldsWithAsterisk: false,
  },
};
