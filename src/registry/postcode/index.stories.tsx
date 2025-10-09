import type {PostcodeComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {PostCodeField} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / custom / postcode',
  component: PostCodeField,
  decorators: [withFormik],
} satisfies Meta<typeof PostCodeField>;

type Story = StoryObj<typeof PostCodeField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'postcode',
      key: 'my.postcode',
      label: 'A simple postcode field',
      inputMask: '9999 AA',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
      validateOn: 'blur',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          postcode: '',
        },
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'postcode',
      key: 'my.postcode',
      label: 'A simple postcode field',
      tooltip: 'Surprise!',
      inputMask: '9999 AA',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
      validateOn: 'blur',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          postcode: '',
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: PostcodeComponentSchema;
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
      type: 'postcode',
      key: 'my.postcode',
      label: 'A postcode field',
      inputMask: '9999 AA',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
        required: true,
      },
      validateOn: 'blur',
    } satisfies PostcodeComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A postcode field');
    expect(textField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidatePattern: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'postcode',
      key: 'my.postcode',
      label: 'A postcode field',
      inputMask: '9999 AA',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
      validateOn: 'blur',
    } satisfies PostcodeComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A postcode field');
    await userEvent.type(textField, 'foobar f10');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findByText('The submitted value does not match the postcode pattern: 1234 AB')
    ).toBeVisible();
  },
};

export const PassesAllValidations: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'postcode',
      key: 'my.postcode',
      label: 'A postcode field',
      inputMask: '9999 AA',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
      validateOn: 'blur',
    } satisfies PostcodeComponentSchema,
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A postcode field');
    await userEvent.type(textField, '1000 XY');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalled();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: PostcodeComponentSchema;
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
      type: 'postcode',
      key: 'my.postcode',
      label: 'A postcode field',
      inputMask: '9999 AA',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
      validateOn: 'blur',
      multiple: false,
    } satisfies PostcodeComponentSchema,
    value: '1000 XY',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'postcode',
      key: 'my.postcode',
      label: 'A postcode field',
      multiple: true,
      inputMask: '9999 AA',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
      validateOn: 'blur',
    } satisfies PostcodeComponentSchema,
    value: ['1000 XY', '2000 YX'],
  },
};
