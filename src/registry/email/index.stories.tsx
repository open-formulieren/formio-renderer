import {EmailComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import FormioForm, {FormioFormProps} from '@/components/FormioForm';
import {withFormik} from '@/sb-decorators';

import FormioEmail from './';

export default {
  title: 'Component registry / basic / email',
  component: FormioEmail,
  decorators: [withFormik],
} satisfies Meta<typeof FormioEmail>;

type Story = StoryObj<typeof FormioEmail>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'my.email',
      label: 'Your email',
      // TODO: implement!
      validateOn: 'blur',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          email: '',
        },
      },
    },
  },
};

export const WithPlaceholder: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'email',
      label: 'Your email',
      // TODO: implement!
      validateOn: 'blur',
      placeholder: 'geralt@kaer.moh.en',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: '',
      },
    },
  },
};

export const WithAutoComplete: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'email',
      label: 'Your email',
      // TODO: implement!
      validateOn: 'blur',
      autocomplete: 'email',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: '',
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: EmailComponentSchema;
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

export const ValidateEmailFormat: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'my.email',
      label: 'Your email',
      // TODO: implement or just ignore it?
      validateOn: 'blur',
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const emailField = canvas.getByLabelText('Your email');
    await userEvent.type(emailField, 'invalid');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid email')).toBeVisible();
  },
};

export const ValidateEmailRequired: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'my.email',
      label: 'Your email',
      // TODO: implement or just ignore it?
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const emailField = canvas.getByLabelText('Your email');
    expect(emailField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const PassesAllValidations: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'my.email',
      label: 'Your email',
      // TODO: implement or just ignore it?
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const emailField = canvas.getByLabelText('Your email');
    await userEvent.type(emailField, 'info@example.com');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalled();
  },
};
