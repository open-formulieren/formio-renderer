import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {ModalProps} from './Modal';
import Modal from './Modal';

const ModalWrapper: React.FC<ModalProps> = ({isOpen, closeModal, ...props}) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(isOpen ?? true);

  // Mimic the "normal" closing behaviour, by updating the `isOpen` property.
  const onClose = () => {
    if (closeModal) {
      closeModal();
    }
    setModalOpen(false);
  };
  return (
    <>
      <p>Text outside the modal dialog</p>
      {!isModalOpen && <button onClick={() => setModalOpen(true)}>show modal</button>}
      <Modal isOpen={isModalOpen} closeModal={onClose} {...props} />
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
  render: args => <ModalWrapper {...args} />,
  play: async ({canvasElement, args, step}) => {
    const canvas = within(canvasElement);

    // Start with modal shown
    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeVisible();

    await step('Close with close button', async () => {
      const closeButton = within(dialog).getByRole('button', {name: 'Close modal'});
      await userEvent.click(closeButton);

      // The `closeModal` arg should have been called, and the modal should no-longer be
      // visible.
      await expect(args.closeModal).toHaveBeenCalled();
      expect(dialog).not.toBeVisible();
    });

    // Open the modal again
    await userEvent.click(canvas.getByRole('button', {name: 'show modal'}));

    await step('Close with escape key', async () => {
      // Hit the escape button on the keyboard
      await userEvent.keyboard('[Escape]');

      // The `closeModal` arg should have been called, and the modal should no-longer be
      // visible.
      await expect(args.closeModal).toHaveBeenCalled();
      expect(dialog).not.toBeVisible();
    });
  },
};
