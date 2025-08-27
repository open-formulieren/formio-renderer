import {FieldsetComponentSchema, TextFieldComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {PrimaryActionButton} from '@utrecht/component-library-react';
import React, {useRef} from 'react';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

import FormioForm, {FormStateRef} from './FormioForm';

export default {
  title: 'Public API / FormioForm',
  component: FormioForm,
  decorators: [
    // Add a submit button for the form
    (Story, {args}) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: '20px',
        }}
      >
        <Story />
        <PrimaryActionButton type="submit" form={args.id} style={{alignSelf: 'flex-start'}}>
          Submit
        </PrimaryActionButton>
      </div>
    ),
  ],
  args: {
    onChange: fn(),
    onSubmit: fn(),
    id: 'formioform',
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

export const Example: Story = {
  args: {
    components: [
      {
        id: 'component1',
        type: 'textfield',
        key: 'nested.textfield',
        label: 'Text field 1',
      } satisfies TextFieldComponentSchema,
    ],
  },
};

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

export const WithValues: Story = {
  args: {
    components: [
      {
        id: 'component1',
        type: 'textfield',
        key: 'nested.textfield',
        label: 'Text field with value',
      } satisfies TextFieldComponentSchema,
      {
        id: 'component2',
        type: 'textfield',
        key: 'nested.textfield2',
        label: 'Text field with default value',
        defaultValue: 'untouched default value',
      } satisfies TextFieldComponentSchema,
    ],
    values: {
      nested: {
        textfield: 'external value',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textInput = canvas.getByLabelText('Text field with value');
    expect(textInput).toHaveDisplayValue('external value');

    const textInput2 = canvas.getByLabelText('Text field with default value');
    expect(textInput2).toHaveDisplayValue('untouched default value');
  },
};

export const WithErrors: Story = {
  args: {
    components: [
      {
        id: 'component1',
        type: 'textfield',
        key: 'nested.textfield',
        label: 'Field with error',
      } satisfies TextFieldComponentSchema,
      {
        id: 'component2',
        type: 'textfield',
        key: 'nested.textfield2',
        label: 'Field without error',
      } satisfies TextFieldComponentSchema,
    ],
    errors: {
      nested: {
        textfield: 'Nested textfield error',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Nested textfield error')).toBeVisible();
  },
};

// existing errors of untouched fields should not be cleared when another field is
// touched
export const InitialErrorsRevalidation: Story = {
  args: {
    components: [
      {
        id: 'component1',
        type: 'textfield',
        key: 'component1',
        label: 'Field 1',
      } satisfies TextFieldComponentSchema,
      {
        id: 'component2',
        type: 'textfield',
        key: 'component2',
        label: 'Field 2',
        validate: {
          pattern: '[0-9]+',
        },
      } satisfies TextFieldComponentSchema,
    ],
    errors: {
      component1: 'External error for field 1',
      component2: 'External error for field 2',
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    await step('Initial errors', async () => {
      expect(await canvas.findByText('External error for field 1')).toBeVisible();
      expect(await canvas.findByText('External error for field 2')).toBeVisible();
    });

    // NOTE - this doesn't work properly if the browser window is not focused. Chrome
    // and Firefox appear not to dispatch the focus/blur events if another window on your
    // device has focus.
    await step('Edit field 2', async () => {
      const input = canvas.getByLabelText('Field 2');
      await userEvent.type(input, 'invalid input');
      input.blur();
      expect(await canvas.findByText('Invalid')).toBeVisible();
      expect(canvas.queryByText('External error for field 2')).not.toBeInTheDocument();
      // may not be removed
      expect(canvas.getByText('External error for field 1')).toBeVisible();
    });
  },
};

export const SetValuesFromParentComponent: Story = {
  render: args => {
    const formRef = useRef<FormStateRef>(null);
    return (
      <>
        <FormioForm {...args} ref={formRef} />
        <PrimaryActionButton
          type="button"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            formRef?.current!.updateValues({nested: {component1: 'Updated value'}});
          }}
        >
          Update component1 value
        </PrimaryActionButton>
      </>
    );
  },
  args: {
    components: [
      {
        id: 'component1',
        type: 'textfield',
        key: 'nested.component1',
        label: 'Field 1',
      } satisfies TextFieldComponentSchema,
      {
        id: 'component2',
        type: 'textfield',
        key: 'nested.component2',
        label: 'Field 2',
      } satisfies TextFieldComponentSchema,
    ],
  },
  play: async ({canvasElement, args, step}) => {
    const canvas = within(canvasElement);

    const input1 = canvas.getByLabelText('Field 1');
    const input2 = canvas.getByLabelText('Field 2');

    await step('Enter values through user interaction', async () => {
      await userEvent.type(input1, 'Original component1 value');
      expect(input1).toHaveDisplayValue('Original component1 value');
      await userEvent.type(input2, 'Original component2 value');
      expect(input2).toHaveDisplayValue('Original component2 value');
    });

    await step('Update values programmatically', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Update component1 value'}));
      await waitFor(() => {
        expect(input1).toHaveDisplayValue('Updated value');
      });
      expect(input2).toHaveDisplayValue('Original component2 value');
    });

    await step('Submit values', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
      await waitFor(() => {
        expect(args.onSubmit).toHaveBeenCalledWith({
          nested: {
            component1: 'Updated value',
            component2: 'Original component2 value',
          },
        });
      });
    });
  },
};

export const SetErrorsFromParentComponent: Story = {
  render: args => {
    const formRef = useRef<FormStateRef>(null);
    return (
      <>
        <FormioForm {...args} ref={formRef} />
        <PrimaryActionButton
          type="button"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            formRef?.current!.updateErrors({
              nested: {component1: 'An outside validation error!'},
            });
          }}
        >
          Set error
        </PrimaryActionButton>
      </>
    );
  },
  args: {
    components: [
      {
        id: 'component1',
        type: 'textfield',
        key: 'nested.component1',
        label: 'Field 1',
      } satisfies TextFieldComponentSchema,
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Set error'}));
    expect(await canvas.findByText('An outside validation error!')).toBeVisible();
  },
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, {hasError: boolean}> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? 'Intentional error boundary.' : this.props.children;
  }
}

export const ThrowsWhenCyclesDetected: Story = {
  decorators: [
    Story => (
      <ErrorBoundary>
        <Story />
      </ErrorBoundary>
    ),
  ],
  args: {
    components: [
      {
        id: 'component1',
        type: 'textfield',
        key: 'component1',
        label: 'Field 1',
        conditional: {
          show: false,
          when: 'component2',
          eq: 'throw',
        },
      } satisfies TextFieldComponentSchema,
      {
        id: 'component2',
        type: 'textfield',
        key: 'component2',
        label: 'Field 2',
        conditional: {
          show: false,
          when: 'component1',
          eq: 'throw',
        },
      } satisfies TextFieldComponentSchema,
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText('Field 1')).not.toBeInTheDocument();
    expect(canvas.queryByText('Field 2')).not.toBeInTheDocument();
    expect(await canvas.findByText('Intentional error boundary.')).toBeVisible();
  },
};

export const EditGridPreviewWithOddConditionals: Story = {
  args: {
    components: [
      {
        type: 'selectboxes',
        id: 'selectboxes',
        key: 'selectboxes',
        label: 'Select boxes',
        values: [{value: 'a', label: 'A'}],
        defaultValue: {a: false},
        openForms: {translations: {}, dataSrc: 'manual'},
      },
      {
        id: 'outer',
        type: 'editgrid',
        key: 'outer',
        label: 'Outer',
        groupLabel: 'Outer item',
        disableAddingRemovingRows: false,
        components: [
          {
            id: 'inner',
            type: 'editgrid',
            key: 'inner',
            label: 'inner',
            groupLabel: 'Inner item',
            disableAddingRemovingRows: false,
            components: [
              {
                type: 'checkbox',
                key: 'checkbox',
                id: 'checkbox',
                label: 'Checkbox',
                defaultValue: false,
              },
              {
                type: 'textfield',
                id: 'content1',
                key: 'content1',
                label: 'Not displayed 1',
                conditional: {
                  show: false,
                  when: 'selectboxes',
                  eq: 'a',
                },
              },
              {
                type: 'textfield',
                id: 'content2',
                key: 'content2',
                label: 'Not displayed 2',
                conditional: {
                  show: false,
                  when: 'outer.inner.checkbox',
                  eq: true,
                },
              },
            ],
          },
        ],
      },
    ],
    // setting to false and then changing it in the UI seemed to lead to an infinite
    // loop -> need to investigate!
    values: {
      selectboxes: {a: true},
      outer: [
        {
          inner: [
            {
              checkbox: true,
              content1: 'Hide me',
              content2: 'Hide me',
            },
          ],
        },
      ],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText('Not displayed 1')).not.toBeInTheDocument();
    expect(canvas.queryByText('Not displayed 2')).not.toBeInTheDocument();
  },
};
