import {BsnComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import {FormioFormProps} from '@/components/FormioForm';
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
    expect(await canvas.findByText('Required')).toBeVisible();
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
    expect(await canvas.findByText('Invalid BSN')).toBeVisible();
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
