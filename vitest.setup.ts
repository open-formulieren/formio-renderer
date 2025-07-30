/// <reference types="@vitest/browser/providers/playwright" />
import {cleanup} from '@testing-library/react';
import {afterEach} from 'vitest';

afterEach(() => {
  cleanup();
});
