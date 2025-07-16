import type {ContentComponentSchema} from '@open-formulieren/types';
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
      html: `
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
      <p><strong>Paragraph</strong>: Lorem ipsum dolor sit amet, <em>consectetur adipiscing
      elit</em>, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
      enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
      ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
      cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
      proident, sunt in culpa qui officia deserunt mollit anim id
      <a href="https://example.com" target="_blank" rel="external">est laborum</a>.</p>`,
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
