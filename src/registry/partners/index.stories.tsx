import type {PartnerDetails, PartnersComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import ValueDisplay from './ValueDisplay';
import {FormioPartnersField} from './index';
import type {ManuallyAddedPartnerDetails} from './types';

export default {
  title: 'Component registry / special / partners',
  component: FormioPartnersField,
  decorators: [withFormik],
  args: {
    componentDefinition: {
      id: 'partners',
      type: 'partners',
      key: 'partners',
      label: 'Partners',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        partners: [
          {
            bsn: '123456789',
            initials: 'J',
            affixes: 'K',
            lastName: 'Boei',
            dateOfBirth: '1980-1-1',
          },
        ],
      },
    },
  },
} satisfies Meta<typeof FormioPartnersField>;

type Story = StoryObj<typeof FormioPartnersField>;

export const MinimalConfiguration: Story = {};

export const WithTooltipAndDescription: Story = {
  args: {
    componentDefinition: {
      id: 'partners',
      type: 'partners',
      key: 'partners',
      label: 'Partners',
      description: 'Some extra context',
      tooltip: 'Surprise!',
    },
  },
};

export const PartnerMissingSomeDetails: Story = {
  parameters: {
    formik: {
      initialValues: {
        partners: [
          {
            bsn: '123456789',
            initials: '',
            affixes: '',
            lastName: 'Boei',
            dateOfBirth: '1980-1-1',
          },
        ],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const missingDataTexts = await canvas.findAllByText('No information provided');
    expect(missingDataTexts).toHaveLength(2);
  },
};

export const MultiplePartners: Story = {
  parameters: {
    formik: {
      initialValues: {
        partners: [
          {
            bsn: '123456789',
            initials: 'J',
            affixes: 'K',
            lastName: 'Boei',
            dateOfBirth: '1980-1-1',
          },
          {
            bsn: '111222333',
            initials: 'D',
            affixes: 'van',
            lastName: 'Dijk',
            dateOfBirth: '1980-10-15',
          },
        ],
      },
    },
  },
};

export const NoPartnersFound: Story = {
  parameters: {
    formik: {
      initialValues: {
        partners: [],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const addPartnerButton = canvas.getByRole('button', {name: 'Add partner details'});
    expect(addPartnerButton).toBeVisible();
  },
};

export const ManuallyAddedPartnerInForm: Story = {
  parameters: {
    formik: {
      initialValues: {
        partners: [
          {
            bsn: '123456789',
            initials: 'J',
            affixes: 'K',
            lastName: 'Boei',
            dateOfBirth: '1980-10-1',
            _OF_INTERNAL_addedManually: true,
          },
        ],
      },
    },
  },
  play: ({canvasElement}) => {
    const canvas = within(canvasElement);

    const bsnInput = canvas.getByLabelText('BSN');
    const initialsInput = canvas.getByLabelText('Initials');
    const affixesInput = canvas.getByLabelText('Affixes');
    const lastnameInput = canvas.getByLabelText('Lastname');
    const monthInput = canvas.getByLabelText('Month');
    const dayInput = canvas.getByLabelText('Day');
    const yearInput = canvas.getByLabelText('Year');

    // All inputs are visible
    expect(bsnInput).toBeVisible();
    expect(initialsInput).toBeVisible();
    expect(affixesInput).toBeVisible();
    expect(lastnameInput).toBeVisible();
    expect(monthInput).toBeVisible();
    expect(dayInput).toBeVisible();
    expect(yearInput).toBeVisible();

    // All inputs have the right content
    expect(bsnInput).toHaveValue('123456789');
    expect(initialsInput).toHaveValue('J');
    expect(affixesInput).toHaveValue('K');
    expect(lastnameInput).toHaveValue('Boei');
    expect(monthInput).toHaveValue('10');
    expect(dayInput).toHaveValue('1');
    expect(yearInput).toHaveValue('1980');
  },
};

interface ValidationStoryArgs {
  componentDefinition: PartnersComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: renderComponentInForm,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      type: 'partners',
      key: 'partners',
      id: 'partners',
      label: 'Partners',
    } satisfies PartnersComponentSchema,
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

    // Add empty partner and show sub-form
    await userEvent.click(canvas.getByRole('button', {name: 'Add partner details'}));

    // Submit empty partner data
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    expect(await canvas.findByText('The required field BSN must be filled in.')).toBeVisible();
    expect(await canvas.findByText('The required field Lastname must be filled in.')).toBeVisible();
    expect(
      await canvas.findByText('The required field Date of birth must be filled in.')
    ).toBeVisible();
  },
};

export const ValidateInvalid: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);

    // Add empty partner and show sub-form
    await userEvent.click(canvas.getByRole('button', {name: 'Add partner details'}));

    await step('Submit invalid partner details', async () => {
      const bsnInput = canvas.getByLabelText('BSN');
      const monthInput = canvas.getByLabelText('Month');
      const dayInput = canvas.getByLabelText('Day');
      const yearInput = canvas.getByLabelText('Year');

      // A bsn value that doesn't pass the 11-test
      await userEvent.type(bsnInput, '123456789');

      // A date way further in the past than 120 years
      await userEvent.type(monthInput, '12');
      await userEvent.type(dayInput, '1');
      await userEvent.type(yearInput, '900');

      // Submit partner data
      await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    });

    await step('Check errors', async () => {
      const bsnError = await canvas.findByText('Invalid BSN.');
      const lastnameError = await canvas.findByText(
        'The required field Lastname must be filled in.'
      );
      const dateOfBirthError = await canvas.findByText(
        'Date of birth must be within the last 120 years.'
      );

      expect(bsnError).toBeVisible();
      expect(lastnameError).toBeVisible();
      expect(dateOfBirthError).toBeVisible();

      // onSubmit should only be called with a valid form
      expect(args.onSubmit).not.toHaveBeenCalled();
    });
  },
};

export const ValidateValid: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    // Add empty partner and show sub-form
    await userEvent.click(canvas.getByRole('button', {name: 'Add partner details'}));

    const bsnInput = canvas.getByLabelText('BSN');
    const initialsInput = canvas.getByLabelText('Initials');
    const affixesInput = canvas.getByLabelText('Affixes');
    const lastnameInput = canvas.getByLabelText('Lastname');
    const monthInput = canvas.getByLabelText('Month');
    const dayInput = canvas.getByLabelText('Day');
    const yearInput = canvas.getByLabelText('Year');

    // A bsn value that passes the 11-test
    await userEvent.type(bsnInput, '111222333');

    await userEvent.type(initialsInput, 'J');
    await userEvent.type(affixesInput, 'de');
    await userEvent.type(lastnameInput, 'Vries');

    // I don't think this test will still run after 120 years,
    // so lets hard code the date of birth.
    await userEvent.type(monthInput, '10');
    await userEvent.type(dayInput, '21');
    await userEvent.type(yearInput, '2025');

    // Submit partner data
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalledWith({
      partners: [
        {
          bsn: '111222333',
          initials: 'J',
          affixes: 'de',
          lastName: 'Vries',
          dateOfBirth: '2025-10-21',
          _OF_INTERNAL_addedManually: true,
        },
      ],
    });
  },
};

export const RemoveManuallyAddedPartner: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);

    await step('Add partner details manually', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Add partner details'}));

      const bsnInput = canvas.getByLabelText('BSN');
      const lastnameInput = canvas.getByLabelText('Lastname');
      const monthInput = canvas.getByLabelText('Month');
      const dayInput = canvas.getByLabelText('Day');
      const yearInput = canvas.getByLabelText('Year');

      // A bsn value that passes the 11-test
      await userEvent.type(bsnInput, '111222333');

      await userEvent.type(lastnameInput, 'Vries');

      // I don't think this test will still run after 120 years,
      // so lets hard code the date of birth.
      await userEvent.type(monthInput, '10');
      await userEvent.type(dayInput, '21');
      await userEvent.type(yearInput, '2025');
    });

    await step('Submit form before removal', async () => {
      // When submitting the form, expect partners to contain partner data.
      await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
      expect(args.onSubmit).toHaveBeenCalledWith({
        partners: [
          {
            bsn: '111222333',
            initials: '',
            affixes: '',
            lastName: 'Vries',
            dateOfBirth: '2025-10-21',
            _OF_INTERNAL_addedManually: true,
          },
        ],
      });
    });

    await step('Remove partner details', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Remove partner details'}));

      // Expect the inputs to have been removed
      const bsnInput = canvas.queryByLabelText('BSN');
      expect(bsnInput).not.toBeInTheDocument();

      // The 'add partner details' button is again shown
      expect(canvas.getByRole('button', {name: 'Add partner details'})).toBeVisible();
    });

    await step('Submit form after removal', async () => {
      // When submitting the form, expect partners to be empty
      await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
      expect(args.onSubmit).toHaveBeenCalledWith({partners: []});
    });
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: PartnersComponentSchema;
  value: ManuallyAddedPartnerDetails[] | PartnerDetails[];
}

type ValueDisplayStory = StoryObj<ValueDisplayStoryArgs>;

const BaseValueDisplayStory: ValueDisplayStory = {
  render: args => <ValueDisplay {...args} />,
  args: {
    componentDefinition: {
      type: 'partners',
      key: 'partners',
      id: 'partners',
      label: 'Partners',
    } satisfies PartnersComponentSchema,
  },
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const SingleValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    value: [
      {
        bsn: '111222333',
        initials: 'E',
        affixes: 'van',
        lastName: 'Boei',
        dateOfBirth: '1980-5-20',
      },
    ] satisfies PartnerDetails[],
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const terms = canvas.getAllByRole('term');
    const definitions = canvas.getAllByRole('definition');

    expect(terms).toHaveLength(5);
    expect(definitions).toHaveLength(5);

    // Unfortunately we cannot link the terms and definitions to each other.
    // So we have to relay on the correctness of the order.
    step('check term and definition values', () => {
      expect(terms[0]).toHaveTextContent('BSN');
      expect(definitions[0]).toHaveTextContent('111222333');

      expect(terms[1]).toHaveTextContent('Initials');
      expect(definitions[1]).toHaveTextContent('E');

      expect(terms[2]).toHaveTextContent('Affixes');
      expect(definitions[2]).toHaveTextContent('van');

      expect(terms[3]).toHaveTextContent('Lastname');
      expect(definitions[3]).toHaveTextContent('Boei');

      expect(terms[4]).toHaveTextContent('Date of birth');
      expect(definitions[4]).toHaveTextContent('May 20, 1980');
    });
  },
};

export const MultipleValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    value: [
      {
        bsn: '111222333',
        initials: 'E',
        affixes: 'van',
        lastName: 'Boei',
        dateOfBirth: '1980-5-20',
      },
      {
        bsn: '123456789',
        initials: 'J',
        affixes: 'de',
        lastName: 'Smith',
        dateOfBirth: '1975-3-13',
      },
    ] satisfies PartnerDetails[],
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const terms = canvas.getAllByRole('term');
    const definitions = canvas.getAllByRole('definition');

    // The details of each partner should be displayed.
    expect(terms).toHaveLength(10);
    expect(definitions).toHaveLength(10);

    // The order of the terms is validated in the previous test.
    // Let's focus on the actual partner details.
    step('check definition values', () => {
      // Partner 1
      expect(definitions[0]).toHaveTextContent('111222333');
      expect(definitions[1]).toHaveTextContent('E');
      expect(definitions[2]).toHaveTextContent('van');
      expect(definitions[3]).toHaveTextContent('Boei');
      expect(definitions[4]).toHaveTextContent('May 20, 1980');

      // Partner 2
      expect(definitions[5]).toHaveTextContent('123456789');
      expect(definitions[6]).toHaveTextContent('J');
      expect(definitions[7]).toHaveTextContent('de');
      expect(definitions[8]).toHaveTextContent('Smith');
      expect(definitions[9]).toHaveTextContent('March 13, 1975');
    });
  },
};

export const EmptyValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    value: [],
  },
};

/**
 * This test is just a sanity check.
 *
 * There should not be any difference between the value display of server fetched and
 * manually defined partner data.
 */
export const ManuallyAddedPartnerValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    value: [
      {
        bsn: '111222333',
        initials: 'E',
        affixes: 'van',
        lastName: 'Boei',
        dateOfBirth: '1980-5-20',
        _OF_INTERNAL_addedManually: true,
      },
    ] satisfies ManuallyAddedPartnerDetails[],
  },
};
