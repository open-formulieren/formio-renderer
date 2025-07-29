import {AnyComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import FormioComponent from '@/components/FormioComponent';
import {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {Fieldset} from './';

export default {
  title: 'Component registry / layout / fieldset',
  component: Fieldset,
  decorators: [withFormik],
  args: {
    renderNested: FormioComponent,
  },
} satisfies Meta<typeof Fieldset>;

type Story = StoryObj<typeof Fieldset>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'fieldset',
      key: 'fieldset',
      label: 'Fieldset label',
      hideHeader: false,
      components: [
        {
          id: 'component2',
          type: 'textfield',
          key: 'my.textfield',
          label: 'A simple textfield',
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

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'fieldset',
      key: 'fieldset',
      label: 'Fieldset label',
      tooltip: 'Surprise!',
      hideHeader: false,
      components: [
        {
          id: 'component2',
          type: 'textfield',
          key: 'my.textfield',
          label: 'A simple textfield',
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

interface ValidationStoryArgs {
  nestedComponents: AnyComponentSchema[];
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: args =>
    renderComponentInForm({
      ...args,
      componentDefinition: {
        id: 'fieldset',
        key: 'fieldset',
        type: 'fieldset',
        label: 'My group of fields',
        hideHeader: false,
        components: args.nestedComponents,
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
    nestedComponents: [
      {
        id: 'textfield',
        key: 'textfield',
        type: 'textfield',
        label: 'A text field',
        validate: {
          maxLength: 3,
        },
      },
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
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A text field');
    await userEvent.type(textField, 'too long');
    const emailField = canvas.getByLabelText('Email address');
    await userEvent.type(emailField, 'bad value');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    expect(await canvas.findByText('String must contain at most 3 character(s)')).toBeVisible();
    expect(await canvas.findByText('Invalid email')).toBeVisible();

    expect(args.onSubmit).not.toHaveBeenCalled();
  },
};
