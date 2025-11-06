import {expect, test} from 'vitest';

import {buildFile} from './test-utils';

test('buildFile produces valid mock data for client-side state', () => {
  const fileData = buildFile({
    name: 'sample.pdf',
    type: 'application/pdf',
    size: 1000,
    state: 'success',
  });

  expect(fileData.clientId).not.toBeUndefined();
  expect(fileData.clientId).not.toEqual('');
  expect(fileData).toEqual(
    expect.objectContaining({
      state: 'success',
      storage: 'url',
      type: 'application/pdf',
      size: 1000,
      originalName: 'sample.pdf',
      name: '',
    })
  );
  expect(fileData.data).toEqual(
    expect.objectContaining({
      form: '',
      name: `${fileData.clientId}.pdf`,
      size: 1000,
      baseUrl: 'https://example.com/',
      project: '',
    })
  );
});

test('buildFile produces valid mock data for service-side state', () => {
  const fileData = buildFile({
    name: 'sample.jpeg',
    type: 'image/jpeg',
    size: 1000,
    state: 'success',
    omitClientState: true,
  });

  expect(fileData.clientId).toBeUndefined();
  expect(fileData.state).toBeUndefined();
  expect(fileData.data.name.endsWith('.jpeg')).toBe(true);
  expect(fileData.data).toEqual(
    expect.objectContaining({
      form: '',
      size: 1000,
      baseUrl: 'https://example.com/',
      project: '',
    })
  );
});
