import type {SignatureComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import {FormioSignatureField as SignatureField} from './';
import ValueDisplay from './ValueDisplay';

const SIGNATURE = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAAAZCAYAAAB5CNMWAAABv0lEQVRYR+3
WwUvCUBwH8O8UBEWSNP0PwrsXsUCiYyAYWqGEWqbdoose+jtKkVlSKHnQkeEpOol/hASGdNI6GYgISbkdwqDYey5kk7fLYPs+2Pf
Db4/HDQZvn2AXkQDHsIicpBDDIrdaHKxc7hIcxyGZPKSoTxdV/WSRIFSrNUQiR1LzcvkaPt8WnQJhWtVYpAiVyh2i0YRUuVS6gt/
vI6xPF1M1Fg1CNsvDYDAgHo/SCVCkVY0l9pgHAqmX6rFIi8wjx7AolBnWImKRHCEoes8U1cRkTR8heP4C4fDuTGWVLtIcll6vR71
ehde7/t19NBpBEO4xHn8gEPDDaDQqdfl1vSawxC8/Pj5BsXgrlbBYlpBIHMBms0Kn06NQuEGr9SS9czpX0Ww+wmQy/TuYZrD6/Xe
4XGvodnuyCPl8BqHQjmyONqAZLLFYJsMjlTqT7cjz55N9bU82RxvQFNZwOITbvYF2+/nPnuJv2Gg8wGw201rI5jWFJbbp9XrweDY
n99cf5RwOB9LpU8Ri+2yDn5YRJ0wQauh0XqTHVusygsFt2O0rstOhJKC5yVJSVulahkUhyLAYFoUARZRNFgXWF7l40c5I035MAAA
AAElFTkSuQmCC`;

export default {
  title: 'Component registry / special / signature',
  component: SignatureField,
  decorators: [withFormik],
} satisfies Meta<typeof SignatureField>;

type Story = StoryObj<typeof SignatureField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'signature',
      type: 'signature',
      key: 'signature',
      label: 'Signature',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        signature: SIGNATURE,
      },
    },
  },
};

export const WithTooltipDescriptionAndFooter: Story = {
  args: {
    componentDefinition: {
      id: 'signature',
      type: 'signature',
      key: 'signature',
      label: 'Signature',
      tooltip: 'Surprise!',
      description: 'Cool description!',
      footer: 'Awesome footer!',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        signature: '',
      },
    },
  },
};

export const NoAsterisks: Story = {
  name: 'No asterisk for required',
  decorators: [withFormSettingsProvider],
  parameters: {
    formSettings: {
      requiredFieldsWithAsterisk: false,
    },
  },
  args: {
    componentDefinition: {
      id: 'signature',
      type: 'signature',
      key: 'signature',
      label: 'Signature',
      validate: {
        required: true,
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: SignatureComponentSchema;
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
      id: 'signature',
      type: 'signature',
      key: 'signature',
      label: 'Signature',
      validate: {
        required: true,
      },
      description: 'Description above the errors',
      footer: 'Footer above description',
    } satisfies SignatureComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateRequiredWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'signature',
      type: 'signature',
      key: 'signature',
      label: 'Signature',
      validate: {
        required: true,
      },
      errors: {required: 'Custom error message for required'},
    } satisfies SignatureComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for required')).toBeVisible();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: SignatureComponentSchema;
  value: string;
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
      id: 'signature',
      type: 'signature',
      key: 'signature',
      label: 'Signature',
    } satisfies SignatureComponentSchema,
    value: SIGNATURE,
  },
};
