import type {AnyComponentSchema} from '@open-formulieren/types';
import type {Decorator, Meta, StoryObj} from '@storybook/react-vite';

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

export type ReferenceMeta = Meta<ReferenceStoryArgs> & {
  title: `Internal API / Reference behaviour / ${string}`;
};

export type Story = StoryObj<ReferenceStoryArgs>;
