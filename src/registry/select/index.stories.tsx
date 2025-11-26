import type {SelectComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import selectEvent from 'react-select-event';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioSelect as Select} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / basic / select',
  component: Select,
  decorators: [withFormik],
} satisfies Meta<typeof Select>;

type Story = StoryObj<typeof Select>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'select',
      key: 'my.select',
      label: 'A simple select',
      dataType: 'string',
      dataSrc: 'values',
      data: {
        values: [
          {value: '1', label: 'First'},
          {value: '2', label: 'Second'},
        ],
      },
      openForms: {translations: {}, dataSrc: 'manual'},
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          select: '',
        },
      },
    },
  },
};

export const Multiple: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'select',
      key: 'my.select',
      label: 'A simple select',
      multiple: true,
      dataType: 'string',
      dataSrc: 'values',
      data: {
        values: [
          {value: '1', label: 'First'},
          {value: '2', label: 'Second'},
        ],
      },
      openForms: {translations: {}, dataSrc: 'manual'},
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          select: ['2'],
        },
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'select',
      key: 'my.select',
      label: 'A simple select',
      tooltip: 'Surprise!',
      dataType: 'string',
      dataSrc: 'values',
      data: {
        values: [
          {value: '1', label: 'First'},
          {value: '2', label: 'Second'},
        ],
      },
      openForms: {translations: {}, dataSrc: 'manual'},
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          select: '',
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: SelectComponentSchema;
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
      type: 'select',
      key: 'my.select',
      label: 'A select',
      validate: {
        required: true,
      },
      dataType: 'string',
      dataSrc: 'values',
      data: {
        values: [
          {value: '1', label: 'First'},
          {value: '2', label: 'Second'},
        ],
      },
      openForms: {translations: {}, dataSrc: 'manual'},
    } satisfies SelectComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const select = canvas.getByLabelText('A select');
    expect(select).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('The required field A select must be filled in.')).toBeVisible();
  },
};

export const ValidateRequiredWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'select',
      key: 'my.select',
      label: 'A select',
      validate: {
        required: true,
      },
      dataType: 'string',
      dataSrc: 'values',
      data: {
        values: [
          {value: '1', label: 'First'},
          {value: '2', label: 'Second'},
        ],
      },
      openForms: {translations: {}, dataSrc: 'manual'},
      errors: {required: 'Custom error message for required'},
    } satisfies SelectComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for required')).toBeVisible();
  },
};

export const PassesAllValidations: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'select',
      key: 'my.select',
      label: 'A select',
      validate: {
        required: true,
      },
      dataType: 'string',
      dataSrc: 'values',
      data: {
        values: [
          {value: '1', label: 'First'},
          {value: '2', label: 'Second'},
        ],
      },
      openForms: {translations: {}, dataSrc: 'manual'},
    } satisfies SelectComponentSchema,
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const select = canvas.getByLabelText('A select');
    // eslint-disable-next-line import/no-named-as-default-member
    await selectEvent.select(select, 'Second');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalled();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: SelectComponentSchema;
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
      id: 'component1',
      type: 'select',
      key: 'my.select',
      label: 'A select',
      multiple: false,
      dataType: 'string',
      dataSrc: 'values',
      data: {
        values: [
          {value: '1', label: 'First'},
          {value: '2', label: 'Second'},
        ],
      },
      openForms: {translations: {}, dataSrc: 'manual'},
    } satisfies SelectComponentSchema,
    value: '1',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'select',
      key: 'my.select',
      label: 'A select',
      multiple: true,
      dataType: 'string',
      dataSrc: 'values',
      data: {
        values: [
          {value: '1', label: 'First'},
          {value: '2', label: 'Second'},
        ],
      },
      openForms: {translations: {}, dataSrc: 'manual'},
    } satisfies SelectComponentSchema,
    value: ['2', '1'],
  },
};
