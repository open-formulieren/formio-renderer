import type {TimeComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioTimeField as TimeField} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / custom / time',
  component: TimeField,
  decorators: [withFormik],
} satisfies Meta<typeof TimeField>;

type Story = StoryObj<typeof TimeField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      type: 'time',
      key: 'my.time',
      id: 'timefield',
      label: 'timefield',
      inputType: 'text',
      format: 'HH:mm',
      validateOn: 'blur',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          time: '',
        },
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      type: 'time',
      key: 'my.time',
      id: 'timefield',
      label: 'timefield',
      inputType: 'text',
      format: 'HH:mm',
      validateOn: 'blur',
      tooltip: 'Surprise!',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          time: '',
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: TimeComponentSchema;
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
      type: 'time',
      key: 'time',
      id: 'timefield',
      label: 'A timefield',
      inputType: 'text',
      format: 'HH:mm',
      validateOn: 'blur',
      validate: {
        required: true,
      },
    } satisfies TimeComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const timeField = canvas.getByLabelText('Hour');
    expect(timeField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: TimeComponentSchema;
  value: string | string[];
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

export const SingleValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      type: 'time',
      key: 'time',
      id: 'timefield',
      label: 'timefield',
      inputType: 'text',
      format: 'HH:mm',
      validateOn: 'blur',
      multiple: false,
    } satisfies TimeComponentSchema,
    value: '12:00:00',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      type: 'time',
      key: 'time',
      id: 'timefield',
      label: 'timefield',
      inputType: 'text',
      format: 'HH:mm',
      validateOn: 'blur',
      multiple: false,
    } satisfies TimeComponentSchema,
    value: ['12:00:00', '00:00:00'],
  },
};
