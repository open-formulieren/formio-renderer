import type {ChildrenComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';

import {FormioChildrenField} from './index';

export default {
  title: 'Component registry / special / children / validation',
  component: FormioChildrenField,
} satisfies Meta<typeof FormioChildrenField>;

interface ValidationStoryArgs {
  componentDefinition: ChildrenComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: renderComponentInForm,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      type: 'children',
      key: 'children',
      id: 'children',
      label: 'Children',
      enableSelection: false,
    } satisfies ChildrenComponentSchema,
  },
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const ValidateRequired: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Add a new child
    await userEvent.click(canvas.getByRole('button', {name: 'Add child'}));

    // Submit the empty child data
    await userEvent.click(canvas.getByRole('button', {name: 'Save'}));

    // All three fields show a required error
    expect(await canvas.findByText('The required field BSN must be filled in.')).toBeVisible();
    expect(
      await canvas.findByText('The required field Firstnames must be filled in.')
    ).toBeVisible();
    expect(
      await canvas.findByText('The required field Date of birth must be filled in.')
    ).toBeVisible();
  },
};

export const ValidateInvalid: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    // Add empty child and show subform
    await userEvent.click(canvas.getByRole('button', {name: 'Add child'}));

    await step('Submit invalid child details', async () => {
      const bsnInput = canvas.getByLabelText('BSN');
      const monthInput = canvas.getByLabelText('Month');
      const dayInput = canvas.getByLabelText('Day');
      const yearInput = canvas.getByLabelText('Year');

      // A bsn value that doesn't pass the 11-test
      await userEvent.type(bsnInput, '123456789');

      // A date further back than 120 years
      await userEvent.type(monthInput, '12');
      await userEvent.type(dayInput, '1');
      await userEvent.type(yearInput, '900');

      // Save child data
      await userEvent.click(canvas.getByRole('button', {name: 'Save'}));
    });

    await step('Check errors', async () => {
      const bsnError = await canvas.findByText('Invalid BSN.');
      const firstNamesError = await canvas.findByText(
        'The required field Firstnames must be filled in.'
      );
      const dateOfBirthError = await canvas.findByText(
        'Date of birth must be within the last 120 years.'
      );

      expect(bsnError).toBeVisible();
      expect(firstNamesError).toBeVisible();
      expect(dateOfBirthError).toBeVisible();
    });
  },
};

export const ValidateDuplicateBsnValues: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const addChildButton = canvas.getByRole('button', {name: 'Add child'});

    const bsn = '111222333';

    await step('Add first child', async () => {
      await userEvent.click(addChildButton);

      const modal = within(await canvas.findByRole('dialog'));

      const bsnInput = modal.getByLabelText('BSN');
      const firstNamesInput = modal.getByLabelText('Firstnames');
      const monthInput = modal.getByLabelText('Month');
      const dayInput = modal.getByLabelText('Day');
      const yearInput = modal.getByLabelText('Year');

      // A bsn value that does pass the 11-test
      await userEvent.type(bsnInput, bsn);
      await userEvent.type(firstNamesInput, 'John Doe');

      // A valid date of birth
      await userEvent.type(monthInput, '12');
      await userEvent.type(dayInput, '1');
      await userEvent.type(yearInput, '2000');

      await userEvent.click(canvas.getByRole('button', {name: 'Save'}));
    });

    await step('Add second child', async () => {
      await userEvent.click(addChildButton);

      const modal = within(await canvas.findByRole('dialog'));

      const bsnInput = modal.getByLabelText('BSN');
      const firstNamesInput = modal.getByLabelText('Firstnames');
      const monthInput = modal.getByLabelText('Month');
      const dayInput = modal.getByLabelText('Day');
      const yearInput = modal.getByLabelText('Year');

      // Using the same bsn value as the first child
      await userEvent.type(bsnInput, bsn);

      await userEvent.type(firstNamesInput, 'Jimmy Doe');

      // A valid date of birth
      await userEvent.type(monthInput, '12');
      await userEvent.type(dayInput, '1');
      await userEvent.type(yearInput, '2000');

      await userEvent.click(canvas.getByRole('button', {name: 'Save'}));
    });

    // Submit form, and trigger validation
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    await step('Check errors', async () => {
      const bsnError = await canvas.findByText(
        'The BSN 111222333 is used for multiple children. Each child must have a unique BSN.'
      );

      expect(bsnError).toBeVisible();
    });
  },
};

export const ValidateValid: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    // Add empty child and show subform
    await userEvent.click(canvas.getByRole('button', {name: 'Add child'}));

    const bsnInput = canvas.getByLabelText('BSN');
    const firstNamesInput = canvas.getByLabelText('Firstnames');
    const monthInput = canvas.getByLabelText('Month');
    const dayInput = canvas.getByLabelText('Day');
    const yearInput = canvas.getByLabelText('Year');

    // A bsn value that passes the 11-test
    await userEvent.type(bsnInput, '111222333');

    await userEvent.type(firstNamesInput, 'Joe');

    // I don't think this test will still run after 120 years,
    // so lets hard code the date of birth.
    await userEvent.type(monthInput, '11');
    await userEvent.type(dayInput, '1');
    await userEvent.type(yearInput, '2025');

    // Submit child data
    await userEvent.click(canvas.getByRole('button', {name: 'Save'}));
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalledWith({
      children: [
        {
          bsn: '111222333',
          firstNames: 'Joe',
          dateOfBirth: '2025-11-01',
          __addedManually: true,
          __id: expect.any(String),
        },
      ],
    });
  },
};

export const ValidateValidWithoutChildren: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    // Submit the empty children data
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    expect(args.onSubmit).toHaveBeenCalledWith({children: []});
  },
};
