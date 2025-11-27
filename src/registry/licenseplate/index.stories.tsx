import type {LicensePlateComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioLicensePlate as LicensePlate} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / custom / licenseplate',
  component: LicensePlate,
  decorators: [withFormik],
} satisfies Meta<typeof LicensePlate>;

type Story = StoryObj<typeof LicensePlate>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$'},
      validateOn: 'blur',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        license: {
          plate: '',
        },
      },
    },
  },
};

export const WithTooltip: Story = {
  ...MinimalConfiguration,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$'},
      validateOn: 'blur',
      tooltip: 'Hello, I am a tooltip',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        license: {
          plate: '',
        },
      },
    },
  },
};

export const Multiple: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$'},
      validateOn: 'blur',
      multiple: true,
    } satisfies LicensePlateComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        license: {
          plate: ['4-67-ABC', '123-ABC-789'],
        },
      },
    },
  },
};

export const MultipleWithItemErrors: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$'},
      validateOn: 'blur',
      multiple: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        license: {
          plate: ['12-34-56', 'auto'],
        },
      },
      initialErrors: {
        license: {
          plate: [undefined, 'Not a valid Dutch license plate number.'],
        },
      },
      initialTouched: {
        license: {
          plate: [true, true],
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: LicensePlateComponentSchema;
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
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {
        pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$',
        required: true,
      },
      validateOn: 'blur',
    } satisfies LicensePlateComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const licensePlate = canvas.getByLabelText('License plate');
    expect(licensePlate).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findByText('The required field License plate must be filled in.')
    ).toBeVisible();
  },
};

export const ValidateRequiredWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {
        pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$',
        required: true,
      },
      validateOn: 'blur',
      errors: {required: 'Custom error message for required'},
    } satisfies LicensePlateComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for required')).toBeVisible();
  },
};

export const ValidatePattern: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {
        pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$',
      },
      validateOn: 'blur',
    } satisfies LicensePlateComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const licensePlate = canvas.getByLabelText('License plate');
    await userEvent.type(licensePlate, '0 AAA 12');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid Dutch license plate.')).toBeVisible();
  },
};

export const PassesValidation: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {
        pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$',
        required: true,
      },
      validateOn: 'blur',
    } satisfies LicensePlateComponentSchema,
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const licensePlate = canvas.getByLabelText('License plate');
    await userEvent.type(licensePlate, '0-AAA-12');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalled();
  },
};

export const ValidationMultiple: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {
        pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$',
        required: true,
      },
      validateOn: 'blur',
      multiple: true,
    } satisfies LicensePlateComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ensure we have three items
    const addButton = canvas.getByRole('button', {name: 'Add another'});
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    const textboxes = canvas.getAllByRole('textbox');
    expect(textboxes).toHaveLength(3);

    await userEvent.type(textboxes[1], 'AAAA-9999'); // not a valid license plate
    await userEvent.type(textboxes[2], '123-abc-def'); // ok

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findByText('The required field License plate must be filled in.')
    ).toBeVisible();
    expect(await canvas.findByText('Invalid Dutch license plate.')).toBeVisible();
  },
};

export const ValidationMultipleWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {
        pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$',
        required: true,
      },
      validateOn: 'blur',
      multiple: true,
      errors: {required: 'Custom error message for required with multiple: true'},
    } satisfies LicensePlateComponentSchema,
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
  componentDefinition: LicensePlateComponentSchema;
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
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {
        pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$',
      },
      validateOn: 'blur',
    } satisfies LicensePlateComponentSchema,
    value: 'AA-AA-12',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'licenseplate',
      key: 'license.plate',
      label: 'License plate',
      validate: {
        pattern: '^[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}\\-[a-zA-Z0-9]{1,3}$',
      },
      validateOn: 'blur',
    } satisfies LicensePlateComponentSchema,
    value: ['AA-AA-12', '1-AAA-23'],
  },
};
