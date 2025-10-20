import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';
import {useArgs} from 'storybook/preview-api';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

import Modal from './Modal';

const withModalTrigger: Decorator = Story => {
  const [{isOpen, closeModal, ...args}, updateArgs] = useArgs();
  return (
    <>
      <p>Text outside the modal dialog</p>
      {!isOpen && <button onClick={() => updateArgs({isOpen: true})}>show modal</button>}
      <Story
        args={{
          ...args,
          isOpen,
          closeModal: () => {
            // After closing the modal, update the story args
            updateArgs({isOpen: false});
            // Make sure to also call the initial defined callback
            closeModal();
          },
        }}
      />
    </>
  );
};

export default {
  title: 'Internal API  / Modal',
  component: Modal,
  args: {
    isOpen: true,
    closeModal: fn(),
    title: 'Modal title',
    children: <span>Simple modal content</span>,
  },
} satisfies Meta<typeof Modal>;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {};

export const WithoutTitle: Story = {
  args: {
    title: undefined,
  },
};

export const CloseModal: Story = {
  decorators: [withModalTrigger],
  args: {
    isOpen: false,
  },
  play: async ({canvasElement, args, step}) => {
    const canvas = within(canvasElement);

    // Open the modal
    const showModalButton = canvas.getByRole('button', {name: 'show modal'});
    await userEvent.click(showModalButton);

    // Start with modal shown
    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeVisible();

    await step('Close with close button', async () => {
      const closeButton = within(dialog).getByRole('button', {name: 'Close modal'});
      await userEvent.click(closeButton);

      // The `closeModal` arg should have been called, and the modal should no-longer be
      // visible.
      await waitFor(() => {
        expect(args.closeModal).toHaveBeenCalled();
        expect(dialog).not.toBeVisible();
      });
    });

    // Open the modal again
    await userEvent.click(showModalButton);

    await step('Close with escape key', async () => {
      // Hit the escape button on the keyboard
      await userEvent.keyboard('[Escape]');

      // The `closeModal` arg should have been called, and the modal should no-longer be
      // visible.
      await waitFor(() => {
        expect(args.closeModal).toHaveBeenCalled();
        expect(dialog).not.toBeVisible();
      });
    });
  },
};
