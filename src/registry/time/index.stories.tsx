import type {TimeComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {TimeField} from './';
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

export const Multiple: Story = {
  args: {
    componentDefinition: {
      type: 'time',
      key: 'my.time',
      id: 'timefield',
      label: 'timefield',
      inputType: 'text',
      format: 'HH:mm',
      validateOn: 'blur',
      multiple: true,
    } satisfies TimeComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          time: ['08:15:00', '17:00'],
        },
      },
    },
  },
};

export const MultipleWithItemErrors: Story = {
  args: {
    componentDefinition: {
      type: 'time',
      key: 'my.time',
      id: 'timefield',
      label: 'timefield',
      inputType: 'text',
      format: 'HH:mm',
      validateOn: 'blur',
      multiple: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          time: ['08:15:00', '1234'],
        },
      },
      initialErrors: {
        my: {
          time: [undefined, 'Not a valid time.'],
        },
      },
      initialTouched: {
        my: {
          time: [true, true],
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

    const timeField = canvas.getByLabelText('A timefield');
    expect(timeField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateMinTime: ValidationStory = {
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
        minTime: '09:00',
      },
    } satisfies TimeComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const timeField = canvas.getByLabelText('A timefield');
    await userEvent.type(timeField, '8:00');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const expectedMesage = 'Time must be after 09:00';
    expect(await canvas.findByText(expectedMesage)).toBeVisible();
  },
};

export const ValidateMaxTime: ValidationStory = {
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
        maxTime: '17:00',
      },
    } satisfies TimeComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const timeField = canvas.getByLabelText('A timefield');
    await userEvent.type(timeField, '23:00');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const expectedMesage = 'Time must be before 17:00';
    expect(await canvas.findByText(expectedMesage)).toBeVisible();
  },
};

export const ValidateMinTimeMaxTime: ValidationStory = {
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
        minTime: '09:00',
        maxTime: '17:00',
      },
    } satisfies TimeComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const timeField = canvas.getByLabelText('A timefield');
    await userEvent.type(timeField, '23:00');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const expectedMesage = 'Time must be in-between 09:00 and 17:00';
    expect(await canvas.findByText(expectedMesage)).toBeVisible();
  },
};

export const ValidateMinTimeMaxTimeNextDay: ValidationStory = {
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
        minTime: '09:00',
        maxTime: '01:00',
      },
    } satisfies TimeComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const timeField = canvas.getByLabelText('A timefield');
    await userEvent.type(timeField, '8:00');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const expectedMesage = 'Time must be in-between 09:00 and 01:00';
    expect(await canvas.findByText(expectedMesage)).toBeVisible();
  },
};

export const ValidationMultiple: ValidationStory = {
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
      multiple: true,
      validate: {
        required: true,
        minTime: '09:00',
      },
    } satisfies TimeComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ensure we have three items
    const addButton = canvas.getByRole('button', {name: 'Add another'});
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    const textboxes = canvas.getAllByLabelText(/A timefield \d/);
    expect(textboxes).toHaveLength(3);

    await userEvent.type(textboxes[1], '8:00'); // too early
    await userEvent.type(textboxes[2], '11:30'); // ok

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
    expect(await canvas.findByText('Time must be after 09:00')).toBeVisible();
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
