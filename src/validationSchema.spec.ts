import {describe, expect, test} from 'vitest';
import {z} from 'zod';

import type {KeySchemaPair} from './validationSchema';
import {composeValidationSchemas, getSchemaAtPath, validateAt} from './validationSchema';

test('Construct simple schema from one key-schema pair', () => {
  const pair: KeySchemaPair = ['foo', z.string()];

  const schema = composeValidationSchemas([pair]);

  expect(schema.shape.foo).toBeInstanceOf(z.ZodString);
});

test('Construct schema from one dotted-key-schema pair', () => {
  const pair: KeySchemaPair = ['foo.bar', z.string()];

  const schema = composeValidationSchemas([pair]);

  expect(schema.shape.foo).toBeInstanceOf(z.ZodObject);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const foo: any = schema.shape.foo;
  expect(foo.shape.bar).toBeInstanceOf(z.ZodString);
});

test('Complex schema composition from multiple key-schema pairs', () => {
  const pairs: KeySchemaPair[] = [
    ['foo.bar.baz', z.string()],
    ['foo.yeet', z.number()],
    ['foo.bar.quux', z.boolean()],
  ];

  const schema = composeValidationSchemas(pairs);

  expect(schema).toBeInstanceOf(z.ZodObject);
  expect(Object.keys(schema.shape)).toEqual(['foo']);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fooSchema: any = schema.shape.foo;
  expect(fooSchema).toBeInstanceOf(z.ZodObject);
  expect(Object.keys(fooSchema.shape)).toEqual(['bar', 'yeet']);

  expect(fooSchema.shape.yeet).toBeInstanceOf(z.ZodNumber);

  const barSchema = fooSchema.shape.bar;
  expect(barSchema).toBeInstanceOf(z.ZodObject);
  expect(barSchema.shape.baz).toBeInstanceOf(z.ZodString);
  expect(barSchema.shape.quux).toBeInstanceOf(z.ZodBoolean);
});

describe('getSchemaAtPath', () => {
  const schema = z.object({
    name: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
    }),
  });

  test('resolves a top-level field', () => {
    const result = getSchemaAtPath(schema, 'name');

    expect(result?.path).toBe('name');
    expect(result?.schema).toBe(schema.shape.name);
  });

  test('resolves a nested field', () => {
    const result = getSchemaAtPath(schema, 'address.street');

    expect(result?.path).toBe('address.street');
    expect(result?.schema).toBe(schema.shape.address.shape.street);
  });

  test('returns the successfully resolved part when the path cannot be fully resolved', () => {
    const result = getSchemaAtPath(schema, 'address.unknown');

    expect(result?.path).toBe('address');
    expect(result?.schema).toBe(schema.shape.address);
  });

  test('returns undefined when the first path segment cannot be resolved', () => {
    const result = getSchemaAtPath(schema, 'unknown');

    expect(result).toBeUndefined();
  });
});

describe('validateAt', () => {
  const schema = z.object({
    phoneNumber: z.string().min(10, 'Phone number is too short'),
    email: z.string().email('Invalid email'),
  });

  test('validates the requested field', async () => {
    await expect(
      validateAt(schema, 'phoneNumber', {
        phoneNumber: '0612345678',
        email: 'test@example.com',
      })
    ).resolves.toBeUndefined();
  });

  test('throws when the requested field is invalid', async () => {
    await expect(
      validateAt(schema, 'phoneNumber', {
        phoneNumber: '123',
        email: 'test@example.com',
      })
    ).rejects.toThrow('Phone number is too short');
  });

  test('does not validate unrelated fields', async () => {
    await expect(
      validateAt(schema, 'phoneNumber', {
        phoneNumber: '0612345678',
        email: 'not-an-email',
      })
    ).resolves.toBeUndefined();
  });

  test('validates nested fields', async () => {
    const nestedSchema = z.object({
      address: z.object({
        street: z.string().min(1),
      }),
    });

    await expect(
      validateAt(nestedSchema, 'address.street', {
        address: {
          street: '',
        },
      })
    ).rejects.toThrow('String must contain at least 1 character(s)');
  });

  test('does not throw when the path cannot be fully resolved', async () => {
    await expect(
      validateAt(schema, 'unknown.field', {
        phoneNumber: '0612345678',
        email: 'test@example.com',
      })
    ).resolves.toBeUndefined();
  });
});
