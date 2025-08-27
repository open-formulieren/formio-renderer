import type {Meta, StoryObj} from '@storybook/react-vite';
import {PrimaryActionButton} from '@utrecht/component-library-react';
import {useState} from 'react';

import Loader, {MODIFIERS} from './Loader';

export default {
  title: 'Internal API / Loader',
  component: Loader,
  args: {
    loading: true,
  },
} satisfies Meta<typeof Loader>;

type Story = StoryObj<typeof Loader>;

export const Default: Story = {};

export const Example: Story = {
  args: {
    loading: false,
    modifiers: ['only-child', 'small', 'gray'],
  },
  render: args => {
    const [isLoading, setLoading] = useState<boolean>(args.loading);
    return (
      <PrimaryActionButton
        type="button"
        onClick={() => {
          // Toggle the loading status
          setLoading(!isLoading);
        }}
      >
        <Loader modifiers={args.modifiers} loading={isLoading} />
        Toggle loading status
      </PrimaryActionButton>
    );
  },
};

export const Modifiers: Story = {
  render: () => {
    return (
      <>
        {MODIFIERS.map(modifier => (
          <div key={modifier} style={{background: '#f1f1f1', padding: 4, marginBottom: 10}}>
            <Loader loading={true} modifiers={[modifier]} />
            <p>
              Modifier: <code>{modifier}</code>
            </p>
          </div>
        ))}
      </>
    );
  },
};
