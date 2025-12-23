import type {BsnComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioBSN as BSN} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / custom / bsn',
  component: BSN,
  decorators: [withFormik],
} satisfies Meta<typeof BSN>;

type Story = StoryObj<typeof BSN>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN field',
      inputMask: '999999999',
      validateOn: 'blur',
    } satisfies BsnComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          bsn: '',
        },
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN field',
      tooltip: 'Surprise!',
      description: 'A description',
      inputMask: '999999999',
      validateOn: 'blur',
    } satisfies BsnComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          bsn: '',
        },
      },
    },
  },
};

export const Multiple: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN field',
      tooltip: 'Surprise!',
      description: 'A description',
      inputMask: '999999999',
      validateOn: 'blur',
      multiple: true,
    } satisfies BsnComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          bsn: ['111222333', '999888777'],
        },
      },
    },
  },
};

export const MultipleWithItemErrors: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN field',
      tooltip: 'Surprise!',
      description: 'A description',
      inputMask: '999999999',
      validateOn: 'blur',
      multiple: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          bsn: ['000000000', '123456789'],
        },
      },
      initialErrors: {
        my: {
          bsn: [undefined, 'Not a valid BSN.'],
        },
      },
      initialTouched: {
        my: {
          bsn: [true, true],
        },
      },
    },
  },
};

export const MultipleReadOnly: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN field',
      inputMask: '999999999',
      validateOn: 'blur',
      multiple: true,
      disabled: true,
    } satisfies BsnComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          bsn: ['111222333', '999888777'],
        },
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textboxes = canvas.getAllByRole('textbox');
    for (const textbox of textboxes) {
      expect(textbox).toBeVisible();
      expect(textbox).not.toBeDisabled();
      expect(textbox).toHaveAttribute('readonly');
    }
  },
};

interface ValidationStoryArgs {
  componentDefinition: BsnComponentSchema;
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
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN',
      inputMask: '999999999',
      validateOn: 'blur',
      validate: {
        required: true,
      },
    } satisfies BsnComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const bsnField = canvas.getByLabelText('A BSN');
    expect(bsnField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('The required field A BSN must be filled in.')).toBeVisible();
  },
};

export const ValidateRequiredWithCustomMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN',
      inputMask: '999999999',
      validateOn: 'blur',
      validate: {
        required: true,
      },
      errors: {
        required: 'Custom error message for required',
      },
    } satisfies BsnComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const bsnField = canvas.getByLabelText('A BSN');
    expect(bsnField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for required')).toBeVisible();
  },
};

export const ValidateBSN: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN',
      inputMask: '999999999',
      validateOn: 'blur',
      validate: {
        required: false,
      },
    } satisfies BsnComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const bsnField = canvas.getByLabelText('A BSN');
    expect(bsnField).toBeVisible();
    await userEvent.type(bsnField, '123456789');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid BSN.')).toBeVisible();
  },
};

export const ValidationMultiple: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN',
      inputMask: '999999999',
      validateOn: 'blur',
      multiple: true,
      validate: {
        required: true,
      },
    } satisfies BsnComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ensure we have three items
    const addButton = canvas.getByRole('button', {name: 'Add another'});
    await userEvent.click(addButton);
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    const textboxes = canvas.getAllByRole('textbox');
    expect(textboxes).toHaveLength(4);

    await userEvent.type(textboxes[0], '123'); // too short
    await userEvent.type(textboxes[1], '1234567890'); // too long
    await userEvent.type(textboxes[2], '123456789'); // not a valid BSN
    await userEvent.type(textboxes[3], '123456782'); // ok

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findAllByText('A BSN must be 9 digits.')).toHaveLength(2);
    expect(await canvas.findByText('Invalid BSN.')).toBeVisible();
  },
};

export const ValidationMultipleWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN',
      inputMask: '999999999',
      validateOn: 'blur',
      multiple: true,
      validate: {
        required: true,
      },
      errors: {required: 'Custom error for required with multiple'},
    } satisfies BsnComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ensure we have multiple items
    const addButton = canvas.getByRole('button', {name: 'Add another'});
    await userEvent.click(addButton);

    const textboxes = canvas.getAllByRole('textbox');
    expect(textboxes).toHaveLength(2);

    // trigger validation
    await userEvent.click(textboxes[0]);
    await userEvent.click(textboxes[1]);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findAllByText('Custom error for required with multiple')).toHaveLength(2);
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: BsnComponentSchema;
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
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN',
      inputMask: '999999999',
      validateOn: 'blur',
      multiple: false,
    } satisfies BsnComponentSchema,
    value: 'Single value',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'bsn',
      key: 'my.bsn',
      label: 'A BSN',
      inputMask: '999999999',
      validateOn: 'blur',
      multiple: true,
    } satisfies BsnComponentSchema,
    value: ['First', 'Second'],
  },
};
