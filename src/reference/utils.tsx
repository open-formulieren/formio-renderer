import {AnyComponentSchema} from '@open-formulieren/types';
import {Meta, StoryObj} from '@storybook/react';
import {fn} from '@storybook/test';
// @ts-expect-error
import {Form as ReactFormioForm} from 'react-formio';

import FormioForm from '@/components/FormioForm';

export interface ReferenceStoryArgs {
  components: AnyComponentSchema[];
}

export type ReferenceMeta = Meta<ReferenceStoryArgs> & {
  title: `Internal API / Reference behaviour / ${string}`;
};

export type Story = StoryObj<ReferenceStoryArgs>;

// usage: await sleep(3000);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const renderCustom = (args: ReferenceStoryArgs) => (
  <FormioForm onSubmit={fn()} {...args} requiredFieldsWithAsterisk />
);

const renderReference = (args: ReferenceStoryArgs) => (
  <>
    <ReactFormioForm
      form={{display: 'form', components: args.components}}
      submission={{data: {}}}
      options={{noAlerts: true}}
    />
    <div
      style={{
        fontStyle: 'italic',
        fontSize: '0.75em',
        textAlign: 'center',
        background: '#CDCDCDAA',
        padding: '0.5em',
        marginBlockStart: '1em',
      }}
    >
      Formio.js SDK reference
    </div>
  </>
);

export const storyFactory = (story: Story): {custom: Story; reference: Story} => {
  const play = story.play;
  const ourStory: Story = {...story, render: renderCustom};
  const referenceStory: Story = {
    ...story,
    render: renderReference,
    play: play
      ? // wrap play function with a timer because Formio takes time to initialize
        async (...args) => {
          await sleep(100);
          await play(...args);
        }
      : undefined,
  };
  return {
    custom: ourStory,
    reference: referenceStory,
  };
};
