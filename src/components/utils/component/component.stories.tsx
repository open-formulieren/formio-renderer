import {Component} from '@components';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';
import React from 'react';

const meta: Meta<typeof Component> = {
  title: 'Components / Utils / Component',
  component: Component,
  decorators: [],
  parameters: {},
};
export default meta;

export const component: ComponentStory<typeof Component> = args => <Component {...args} />;
component.args = {
  children: 'The quick brown fox jumps over the lazy dog.',
};
component.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  expect(canvas.getByText('The quick brown fox jumps over the lazy dog.')).toBeTruthy();
};
