import {RenderForm} from '@lib/renderer';
import {PlayFunction} from '@storybook/csf/dist/story';
import {Args, ComponentStory} from '@storybook/react';
import React from 'react';
// @ts-ignore
import {Form} from 'react-formio';

/**
 * Generates a tuple of 2 stories, one for Form.io and one For RenderForm. Both stories receive
 * `args` and `play` function.
 */
export const compatibilityStoriesFactory = (args: Args, play: PlayFunction) => {
  const FormioStory = (args: Args) => <Form {...args} />;
  FormioStory.args = args;
  FormioStory.play = play;

  const RenderFormStory: ComponentStory<typeof RenderForm> = args => <RenderForm {...args} />;
  RenderFormStory.args = structuredClone(args);
  RenderFormStory.play = play;

  return [FormioStory, RenderFormStory];
};
