import type {IbanComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
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

export const Multiple: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'iban',
      key: 'my.iban',
      label: 'An IBAN field',
      validateOn: 'blur',
      multiple: true,
    } satisfies IbanComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          iban: ['NL91 ABNA 0417 1643 00', 'NL91ABNA0417164300'],
        },
      },
    },
  },
};

export const MultipleWithItemErrors: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'iban',
      key: 'my.iban',
      label: 'An IBAN field',
      validateOn: 'blur',
      multiple: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          iban: ['NL91ABNA0417164300', '1234'],
        },
      },
      initialErrors: {
        my: {
          iban: [undefined, 'Not a valid IBAN.'],
        },
      },
      initialTouched: {
        my: {
          iban: [true, true],
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

export const ValidateRequiredWithCustomErrorMessage: ValidationStory = {
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
      errors: {required: 'Custom error message for required'},
    } satisfies IbanComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for required')).toBeVisible();
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

export const ValidationMultiple: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'iban',
      key: 'my.iban',
      label: 'An IBAN field',
      validateOn: 'blur',
      multiple: true,
      validate: {
        required: true,
      },
    } satisfies IbanComponentSchema,
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

    await userEvent.type(textboxes[1], 'NL90ABNA0417164300'); // wrong check digits
    await userEvent.type(textboxes[2], 'NL91 ABNA 0417 1643 00'); // ok
    await userEvent.type(textboxes[3], 'NL91ABNA0417164300'); // ok

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
    expect(await canvas.findByText('Invalid IBAN')).toBeVisible();
  },
};

export const ValidationMultipleWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'iban',
      key: 'my.iban',
      label: 'An IBAN field',
      validateOn: 'blur',
      multiple: true,
      validate: {
        required: true,
      },
      errors: {required: 'Custom error message for required with multiple: true'},
    } satisfies IbanComponentSchema,
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

    expect(
      await canvas.findAllByText('Custom error message for required with multiple: true')
    ).toHaveLength(2);
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
