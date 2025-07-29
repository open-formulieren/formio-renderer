import {CheckboxComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioCheckbox as Checkbox} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / basic / checkbox',
  component: Checkbox,
  decorators: [withFormik],
} satisfies Meta<typeof Checkbox>;

type Story = StoryObj<typeof Checkbox>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'checkbox',
      key: 'my.checkbox',
      label: 'A simple checkbox',
      defaultValue: false,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          checkbox: true,
        },
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'checkbox',
      key: 'my.checkbox',
      label: 'A simple checkbox',
      defaultValue: false,
      tooltip: 'Surprise!',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          checkbox: false,
        },
      },
    },
  },
};

export const WithDescription: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'checkbox',
      key: 'my.checkbox',
      label: 'A simple checkbox',
      defaultValue: false,
      description: 'Description as help text',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          checkbox: false,
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: CheckboxComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: renderComponentInForm,
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
      type: 'checkbox',
      key: 'my.checkbox',
      label: 'A required checkbox',
      defaultValue: false,
      validate: {required: true},
    } satisfies CheckboxComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A required checkbox');
    expect(textField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: CheckboxComponentSchema;
  value: boolean;
}

type ValueDisplayStory = StoryObj<ValueDisplayStoryArgs>;

const BaseValueDisplayStory: ValueDisplayStory = {
  render: args => <ValueDisplay {...args} />,
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const CheckedValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'checkbox',
      key: 'my.checkbox',
      label: 'A checkbox',
      defaultValue: false,
    } satisfies CheckboxComponentSchema,
    value: true,
  },
};

export const UncheckedValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'checkbox',
      key: 'my.checkbox',
      label: 'A checkbox',
      defaultValue: false,
    } satisfies CheckboxComponentSchema,
    value: false,
  },
};
