import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';

import UploadedFileList from './UploadedFileList';

export default {
  title: 'Component registry / basic / file / UploadedFileList',
  component: UploadedFileList,
  args: {
    files: [],
    multipleAllowed: false,
  },
} satisfies Meta<typeof UploadedFileList>;

type Story = StoryObj<typeof UploadedFileList>;

export const SingleFile: Story = {
  args: {
    files: [
      {
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
        name: 'document.pdf',
        size: 12345,
        downloadUrl: 'https://example.com/document.pdf',
        state: 'error',
        errors: ['PDF not allowed.'],
      },
      {
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
