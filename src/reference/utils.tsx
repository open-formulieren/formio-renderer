import {AnyComponentSchema} from '@open-formulieren/types';
import {Decorator, Meta, StoryObj} from '@storybook/react';
import {fn} from '@storybook/test';
import {PrimaryActionButton} from '@utrecht/component-library-react';
// @ts-expect-error
import {Form as ReactFormioForm} from 'react-formio';

import FormioForm from '@/components/FormioForm';
import {JSONObject} from '@/types';

export const hideSpinner: Decorator = Story => (
  <>
    <style>{`.fa-spin { display: none;}`}</style>
    <Story />
  </>
);

export interface ReferenceStoryArgs {
  components: AnyComponentSchema[];
  submissionData?: JSONObject;
  onSubmit?: (values: JSONObject) => void;
}

export type ReferenceMeta = Meta<ReferenceStoryArgs> & {
  title: `Internal API / Reference behaviour / ${string}`;
};

export type Story = StoryObj<ReferenceStoryArgs>;

// usage: await sleep(3000);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const renderCustom = (args: ReferenceStoryArgs) => {
  const {onSubmit = fn(), submissionData = undefined, ...props} = args;
  return (
    <FormioForm
      values={submissionData}
      onSubmit={async v => onSubmit(v)}
      {...props}
      requiredFieldsWithAsterisk
    >
      <PrimaryActionButton type="submit" style={{alignSelf: 'flex-start', marginTop: '20px'}}>
        Submit
      </PrimaryActionButton>
    </FormioForm>
  );
};

const renderReference = (args: ReferenceStoryArgs) => (
  <>
    <ReactFormioForm
      form={{
        display: 'form',
        components: [
          ...args.components,
          {
            type: 'button',
            key: 'submit',
            label: 'Submit',
            input: true,
          },
        ],
      }}
      submission={{data: args.submissionData ?? {}}}
      options={{noAlerts: true}}
      onSubmit={(event: {data: JSONObject}) => {
        const {submit, ...values} = event.data;
        args.onSubmit?.(values);
      }}
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
