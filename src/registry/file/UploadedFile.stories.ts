import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';

import UploadedFile from './UploadedFile';

export default {
  title: 'Component registry / basic / file / UploadedFile',
  component: UploadedFile,
  args: {
    name: 'image.png',
    downloadUrl: 'https://example.com',
    size: 2129,
    state: 'success',
    onRemove: fn(),
  },
} satisfies Meta<typeof UploadedFile>;

type Story = StoryObj<typeof UploadedFile>;

export const BytesFileSize: Story = {
  args: {
    size: 500,
    name: 'cover letter.docx',
  },
};

export const KBFileSize: Story = {
  args: {
    size: 3456,
  },
};

export const MBFileSize: Story = {
  args: {
    size: 1200345,
    name: 'attachment-1 (2).pdf',
  },
};

export const LongFileName: Story = {
  args: {
    name: `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
    nisi ut aliquip ex ea commodo consequat.PDF`,
  },
};

export const UploadInProgress: Story = {
  args: {
    state: 'pending',
  },
};

export const Errors: Story = {
  args: {
    size: 2000000,
    errors: ['This file type is not allowed.', 'Your file is too powerful, the limit is 100 kB.'],
  },
};
