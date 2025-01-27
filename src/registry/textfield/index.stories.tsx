import {TextFieldComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import FormioForm, {FormioFormProps} from '@/components/FormioForm';
import {withFormik} from '@/sb-decorators';

import TextField from './';

export default {
  title: 'Component registry / basic / textfield',
  component: TextField,
  decorators: [withFormik],
} satisfies Meta<typeof TextField>;

type Story = StoryObj<typeof TextField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A simple textfield',
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

export const WithPlaceholder: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'textfield',
      label: 'A simple textfield',
      placeholder: 'Ada',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        textfield: '',
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: TextFieldComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: args => (
    <FormioForm
      onSubmit={args.onSubmit}
      components={[args.componentDefinition]}
      requiredFieldsWithAsterisk
    >
      <div style={{marginBlockStart: '20px'}}>
        <button type="submit">Submit</button>
      </div>
    </FormioForm>
  ),
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const ValidateRequired: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        required: true,
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A textfield');
    expect(textField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateMaxLength: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        maxLength: 3,
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A textfield');
    await userEvent.type(textField, 'too long');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('String must contain at most 3 character(s)')).toBeVisible();
  },
};

export const ValidatePattern: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        pattern: '^yeet{1,3}$',
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A textfield');
    await userEvent.type(textField, 'ayeet');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid')).toBeVisible();
  },
};

export const PassesAllValidations: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        required: true,
        pattern: '[a-zA-Z]{2}[0-9]{2,4}.*',
        maxLength: 10,
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A textfield');
    await userEvent.type(textField, 'ab999cd');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalled();
  },
};
