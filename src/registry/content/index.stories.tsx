import {ContentComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';

import {FormioContent as Content} from './';

export default {
  title: 'Component registry / basic / content',
  component: Content,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'content',
      key: 'my.content',
      html: '',
      customClass: '',
    },
  },
} satisfies Meta<typeof Content>;

type Story = StoryObj<typeof Content>;

export const SimpleContent: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'content',
      key: 'my.content',
      html: `<p>Lorem ipsum <a href="#">dolor</a> sit amet, consectetur adipiscing elit.
        Quisque a felis ante. Nunc dictum, dui et scelerisque euismod, ex dui sodales 
        magna, quis vehicula nulla justo sed urna. <strong>Integer</strong> maximus
        tempus tellus vel commodo. <br>Orci varius <i>natoque</i> penatibus et magnis
        dis parturient montes.</p>`,
      label: 'A Content field',
      customClass: '',
    } satisfies ContentComponentSchema,
  },
};

export const ContentWithVariant: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'content',
      key: 'my.content',
      html: `<p>Lorem ipsum <a href="#">dolor</a> sit amet, consectetur adipiscing elit.
        Quisque a felis ante. Nunc dictum, dui et scelerisque euismod, ex dui sodales 
        magna, quis vehicula nulla justo sed urna. <strong>Integer</strong> maximus
        tempus tellus vel commodo. <br>Orci varius <i>natoque</i> penatibus et magnis
        dis parturient montes.</p>`,
      label: 'A Content field',
      customClass: 'success',
    } satisfies ContentComponentSchema,
  },
};
