import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';
import {Paragraph} from '@utrecht/component-library-react';
import {Formik} from 'formik';
import {useArgs} from 'storybook/preview-api';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

import {Checkbox} from '@/components/forms';

import FormFieldContainer from '../FormFieldContainer';
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
    noPortal: true,
  },
} satisfies Meta<typeof Modal>;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {};

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

export const WithPortal: Story = {
  args: {
    noPortal: false,
  },
};

export const OutlinesVisible: Story = {
  args: {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
    children: (
      <Formik initialValues={{test: false, testLast: true}} onSubmit={fn()}>
        <FormFieldContainer>
          <Checkbox name="test" label="On focus, entire outline is visible" />
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
          </Paragraph>
          <Paragraph>
            ed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
            architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas
            sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit
            amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut
            labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
            nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
            consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam
            nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla
            pariatur?
          </Paragraph>
          <Paragraph>
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
            voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint
            occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt
            mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
            expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque
            nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda
            est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut
            rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non
            recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
            voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
          </Paragraph>
          <Checkbox name="testLast" label="And as last child?" />
        </FormFieldContainer>
      </Formik>
    ),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const checkbox = await canvas.findByRole('checkbox', {name: /On focus/});
    checkbox.focus();
  },
};
