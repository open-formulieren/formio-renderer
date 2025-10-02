import {TextFieldComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioPostCode as PostalCodeField} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / basic / postalcodefield',
  component: PostalCodeField,
  decorators: [withFormik],
} satisfies Meta<typeof PostalCodeField>;

type Story = StoryObj<typeof PostalCodeField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.postalcodefield',
      label: 'A simple postalcodefield',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          postalcode: '',
        },
      },
    },
  },
};

export const WithPlaceholder: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'postalcodefield',
      label: 'A simple postalcodefield',
      placeholder: 'Ada',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        postalcode: '',
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.postalcodefield',
      label: 'A simple postalcodefield',
      tooltip: 'Surprise!',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          postalcode: '',
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: TextFieldComponentSchema;
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
      type: 'textfield',
      key: 'my.postalcodefield',
      label: 'A postalcode field',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
        required: true,
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A postalcode field');
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
      type: 'textfield',
      key: 'my.postalcodefield',
      label: 'A postalcode field',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A postalcode field');
    await userEvent.type(textField, 'foobar f10');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid')).toBeVisible();
  },
};

export const PassesAllValidations: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.postalcodefield',
      label: 'A postalcode field',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A postalcode field');
    await userEvent.type(textField, '1000 XY');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalled();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: TextFieldComponentSchema;
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
      type: 'textfield',
      key: 'my.postalcodefield',
      label: 'A postalcodefield',
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
      multiple: false,
    } satisfies TextFieldComponentSchema,
    value: '1000 XY',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.postalcodefield',
      label: 'A postalcodefield',
      multiple: true,
      validate: {
        pattern: '^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[a-zA-Z]{2}$',
      },
    } satisfies TextFieldComponentSchema,
    value: ['1000 XY', '2000 YX'],
  },
};
