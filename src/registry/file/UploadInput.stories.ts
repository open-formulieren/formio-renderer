/**
 * @note I have not been succesful in writing interaction tests for the D&D interaction,
 * despite available documentation. Something seems to go wrong when trying to create/pass
 * a `DataTransfer` object, which clears the files and react-dropzone doesn't "see" any
 * files being dropped, so nothing fires.
 *
 * Upstream documentation: https://react-dropzone.js.org/#testing, which does not work
 * because of: https://github.com/testing-library/dom-testing-library/issues/1350 and
 * manually creating the DataTransfer instance loses information somewhere along the
 * way.
 */
import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';

import UploadInput from './UploadInput';

export default {
  title: 'Component registry / basic / file / UploadInput',
  component: UploadInput,
  args: {
    inputId: 'file-upload',
    onFileAdded: fn(),
  },
} satisfies Meta<typeof UploadInput>;

type Story = StoryObj<typeof UploadInput>;

export const AcceptSingle: Story = {
  args: {
    multiple: false,
    accept: {
      'image/*': [],
      'application/pdf': [],
    },
  },
};

export const AcceptMultiple: Story = {
  args: {
    multiple: true,
  },
};

export const AcceptMultipleWithLimit: Story = {
  args: {
    multiple: true,
    maxFiles: 5,
  },
};

export const NonDefaultMaxSize: Story = {
  args: {
    maxSize: 1024 ** 2 * 3, // 3 MiB
  },
};
