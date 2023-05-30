import {RenderForm} from '@lib/renderer';
import {expect} from '@storybook/jest';
import type {Meta} from '@storybook/react';
import {userEvent, waitFor, within} from '@storybook/testing-library';

import {compatibilityStoriesFactory} from '../utils/compatibility-stories-factory';
import {delay} from '../utils/delay';

const meta: Meta<typeof RenderForm> = {
  title: 'Tests / Compatibility / Validation',
  component: RenderForm,
  decorators: [],
  parameters: {},
};
export default meta;

export const [FormioTextfieldWithMaxLengthValidation, RenderFormTextfieldWithMaxLengthValidation] =
  compatibilityStoriesFactory(
    {
      form: {
        display: 'form',
        components: [
          {
            type: 'textfield',
            key: 'firstName',
            label: 'first name',
            validate: {
              maxLength: 10,
            },
          },
        ],
      },
    },
    async ({canvasElement}) => {
      const canvas = within(canvasElement);
      const input = await canvas.findByLabelText('first name');
      userEvent.click(input);
      await delay();
      await userEvent.type(input, 'The quick brown fox jumps over the lazy dog', {delay: 10});
      await waitFor(async () =>
        canvas.findByText('first name must have no more than 10 characters.')
      );
    }
  );

export const [FormioTextfieldWithMinLengthValidation, RenderFormTextfieldWithMinLengthValidation] =
  compatibilityStoriesFactory(
    {
      form: {
        display: 'form',
        components: [
          {
            type: 'textfield',
            key: 'firstName',
            label: 'first name',
            validate: {
              minLength: 10,
            },
          },
        ],
      },
    },
    async ({canvasElement}) => {
      const canvas = within(canvasElement);
      const input = await canvas.findByLabelText('first name');
      userEvent.click(input);
      await waitFor(() => expect(input).toHaveFocus());
      await userEvent.type(input, 'The quick', {delay: 10});
      await waitFor(async () => canvas.findByText('first name must have at least 10 characters.'));
    }
  );

export const [FormioTextfieldWithPatternValidation, RenderFormTextfieldWithPatternValidation] =
  compatibilityStoriesFactory(
    {
      form: {
        display: 'form',
        components: [
          {
            type: 'textfield',
            key: 'postcode',
            label: 'Postcode',
            validate: {
              pattern: '^\\d{4}\\s?[a-zA-Z]{2}$',
            },
          },
        ],
      },
    },
    async ({canvasElement}) => {
      const canvas = within(canvasElement);
      const input = await canvas.findByLabelText('Postcode');
      userEvent.click(input);
      await waitFor(() => expect(input).toHaveFocus());
      await userEvent.type(input, '123 AB', {delay: 10});
      expect(
        await canvas.findByText('Postcode does not match the pattern ^\\d{4}\\s?[a-zA-Z]{2}$')
      ).toBeVisible();
    }
  );

export const [FormioTextfieldWithRequiredValidation, RenderFormTextfieldWithRequiredValidation] =
  compatibilityStoriesFactory(
    {
      form: {
        display: 'form',
        components: [
          {
            type: 'textfield',
            key: 'firstName',
            label: 'first name',
            validate: {
              required: true,
            },
          },
        ],
      },
    },
    async ({canvasElement}) => {
      const canvas = within(canvasElement);
      const input = await canvas.findByLabelText('first name');
      userEvent.click(input);
      await waitFor(() => expect(input).toHaveFocus());
      await userEvent.type(input, 'John', {delay: 10});
      await userEvent.clear(input);
      expect(await canvas.findByText('first name is required')).toBeVisible();
    }
  );
