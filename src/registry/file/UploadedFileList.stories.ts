import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, within} from 'storybook/test';

import UploadedFileList from './UploadedFileList';

export default {
  title: 'Component registry / basic / file / UploadedFileList',
  component: UploadedFileList,
  args: {
    files: [],
    multipleAllowed: false,
    onRemove: fn(),
  },
} satisfies Meta<typeof UploadedFileList>;

type Story = StoryObj<typeof UploadedFileList>;

export const SingleFile: Story = {
  args: {
    files: [
      {
        uniqueId: 'e891c99d-09dd-4cc4-849b-b33b61e55720',
        name: 'document.pdf',
        size: 12345,
        downloadUrl: 'https://example.com/document.pdf',
        state: 'success',
        errors: undefined,
      },
    ],
    multipleAllowed: false,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const fileList = canvas.getByRole('list', {name: 'Uploaded file'});

    expect(fileList).toBeVisible();
  },
};

export const MultipleFiles: Story = {
  args: {
    files: [
      {
        uniqueId: 'cdf7679a-f04f-4820-ac2d-cbcf0559bc32',
        name: 'document.pdf',
        size: 12345,
        downloadUrl: 'https://example.com/document.pdf',
        state: 'error',
        errors: ['PDF not allowed.'],
      },
      {
        uniqueId: 'd509a862-09e9-4ff7-905a-40738a835bfa',
        name: 'image.jpeg',
        size: 412000,
        downloadUrl: 'https://example.com/image.jpeg',
        state: 'pending',
        errors: undefined,
      },
    ],
    multipleAllowed: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const fileList = canvas.getByRole('list', {name: 'Uploaded files'});

    expect(fileList).toBeVisible();
  },
};
