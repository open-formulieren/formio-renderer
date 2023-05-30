import {RenderForm} from '@lib/renderer';
import {expect} from '@storybook/jest';
import type {Meta} from '@storybook/react';
import {userEvent, waitFor, within} from '@storybook/testing-library';

import {compatibilityStoriesFactory} from '../utils/compatibility-stories-factory';
import {delay} from '../utils/delay';

const meta: Meta<typeof RenderForm> = {
  title: 'Tests / Compatibility / TextField',
  component: RenderForm,
  decorators: [],
  parameters: {},
};
export default meta;

export const [FormioTextfieldHasNoCharcountByDefault, RenderFormTextfieldHasNoCharcountByDefault] =
  compatibilityStoriesFactory(
    {
      form: {
        display: 'form',
        components: [{type: 'textfield', key: 'firstName', label: 'first name'}],
      },
    },
    async ({canvasElement}) => {
      const canvas = within(canvasElement);
      const input = await canvas.findByLabelText('first name');
      userEvent.click(input);
      await waitFor(() => expect(input).toHaveFocus());
      await userEvent.type(input, 'John', {delay: 10});
      await delay(300);
      expect(canvas.queryByText('4 characters')).toBeNull();
    }
  );

export const [FormioTextfieldWithCharcount, RenderFormTextfieldWithCharcount] =
  compatibilityStoriesFactory(
    {
      form: {
        display: 'form',
        components: [
          {type: 'textfield', key: 'firstName', label: 'first name', showCharCount: true},
        ],
      },
    },
    async ({canvasElement}) => {
      const canvas = within(canvasElement);
      const input = await canvas.findByLabelText('first name');
      userEvent.click(input);
      await waitFor(() => expect(input).toHaveFocus());
      await userEvent.type(input, 'John', {delay: 30});
      expect(await canvas.findByText('4 characters')).toBeVisible();
    }
  );

export const [FormioTextfieldWithoutCharcount, RenderFormTextfieldWithoutCharcount] =
  compatibilityStoriesFactory(
    {
      form: {
        display: 'form',
        components: [
          {type: 'textfield', key: 'firstName', label: 'first name', showCharCount: false},
        ],
      },
    },
    async ({canvasElement}) => {
      const canvas = within(canvasElement);
      const input = await canvas.findByLabelText('first name');
      userEvent.click(input);
      await waitFor(() => expect(input).toHaveFocus());
      await userEvent.type(input, 'John', {delay: 10});
      await delay(300);
      expect(canvas.queryByText('4 characters')).toBeNull();
    }
  );

export const [FormioTextfieldWithDescription, RenderFormTextfieldWithDescription] =
  compatibilityStoriesFactory(
    {
      form: {
        display: 'form',
        components: [
          {
            type: 'textfield',
            key: 'firstName',
            label: 'first name',
            description: 'Enter your first name',
          },
        ],
      },
    },
    async ({canvasElement}) => {
      const canvas = within(canvasElement);
      expect(await canvas.findByText('Enter your first name')).toBeVisible();
    }
  );
