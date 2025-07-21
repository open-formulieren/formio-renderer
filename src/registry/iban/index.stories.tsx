import {IbanComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioIBAN as IBAN} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / custom / iban',
  component: IBAN,
  decorators: [withFormik],
} satisfies Meta<typeof IBAN>;

type Story = StoryObj<typeof IBAN>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'iban',
      key: 'my.iban',
      label: 'An IBAN field',
      validateOn: 'blur',
    } satisfies IbanComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          iban: '',
        },
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'iban',
      key: 'my.iban',
      label: 'An IBAN',
      tooltip: 'Surprise!',
      description: 'A description',
      validateOn: 'blur',
    } satisfies IbanComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          iban: '',
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: IbanComponentSchema;
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
      type: 'iban',
      key: 'my.iban',
      label: 'An IBAN',
      validateOn: 'blur',
      validate: {
        required: true,
      },
    } satisfies IbanComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const ibanField = canvas.getByLabelText('An IBAN');
    expect(ibanField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateIBAN: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'iban',
      key: 'my.iban',
      label: 'An IBAN',
      validateOn: 'blur',
      validate: {
        required: false,
      },
    } satisfies IbanComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const ibanField = canvas.getByLabelText('An IBAN');
    expect(ibanField).toBeVisible();
    await userEvent.type(ibanField, 'This is not an IBAN');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid IBAN')).toBeVisible();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: IbanComponentSchema;
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
      type: 'iban',
      key: 'my.iban',
      label: 'An IBAN',
      validateOn: 'blur',
      multiple: false,
    } satisfies IbanComponentSchema,
    value: 'NL91ABNA0417164300',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'iban',
      key: 'my.iban',
      label: 'An IBAN',
      validateOn: 'blur',
      multiple: true,
    } satisfies IbanComponentSchema,
    value: ['IE64 IRCE 9205 0112 3456 78', 'BI1320001100010000123456789'],
  },
};
