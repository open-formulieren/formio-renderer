import type {AnyComponentSchema} from '@open-formulieren/types';
import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';

import {PrimaryActionButton} from '@/components/Button';
import FormioForm from '@/components/FormioForm';
import type {JSONObject} from '@/types';

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

export const render = (args: ReferenceStoryArgs) => {
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

export type ReferenceMeta = Meta<ReferenceStoryArgs> & {
  title: `Internal API / Reference behaviour / ${string}`;
};

export type Story = StoryObj<ReferenceStoryArgs>;
