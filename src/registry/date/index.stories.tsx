import {DateComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioDate} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / custom / date',
  component: FormioDate,
  decorators: [withFormik],
} satisfies Meta<typeof FormioDate>;

type Story = StoryObj<typeof FormioDate>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
    } satisfies DateComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          date: '',
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: DateComponentSchema;
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
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      validate: {
        required: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const yearInput = canvas.getByLabelText('Year');
    expect(yearInput).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateValidDate: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      validate: {
        required: false,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const monthInput = canvas.getByLabelText('Month');
    await userEvent.type(monthInput, '13');

    const dayInput = canvas.getByLabelText('Day');
    await userEvent.type(dayInput, '8');

    const yearInput = canvas.getByLabelText('Year');
    await userEvent.type(yearInput, '2000');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid input')).toBeVisible();

    expect(monthInput).toHaveDisplayValue('13');
    expect(dayInput).toHaveDisplayValue('8');
    expect(yearInput).toHaveDisplayValue('2000');
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: DateComponentSchema;
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
      type: 'date',
      key: 'my.date',
      label: 'A date field',
      multiple: false,
    } satisfies DateComponentSchema,
    value: '1980-01-01',
  },
};

export const SingleEmptyValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'A date field',
      multiple: false,
    } satisfies DateComponentSchema,
    value: '',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'A date field',
      multiple: true,
    } satisfies DateComponentSchema,
    value: ['1980-01-01', '', '2025-03-21'],
  },
};
