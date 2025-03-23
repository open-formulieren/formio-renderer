import {expect, test} from 'vitest';
import {z} from 'zod';

import {KeySchemaPair, composeValidationSchemas} from './validationSchema';

test('Construct simple schema from one key-schema pair', () => {
  const pair: KeySchemaPair = ['foo', z.string()];

  const schema = composeValidationSchemas([pair]);

  expect(schema.shape.foo).toBeInstanceOf(z.ZodString);
});

test('Construct schema from one dotted-key-schema pair', () => {
  const pair: KeySchemaPair = ['foo.bar', z.string()];

  const schema = composeValidationSchemas([pair]);

  expect(schema.shape.foo).toBeInstanceOf(z.ZodObject);

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

  const fooSchema: any = schema.shape.foo;
  expect(fooSchema).toBeInstanceOf(z.ZodObject);
  expect(Object.keys(fooSchema.shape)).toEqual(['bar', 'yeet']);

  expect(fooSchema.shape.yeet).toBeInstanceOf(z.ZodNumber);

  const barSchema = fooSchema.shape.bar;
  expect(barSchema).toBeInstanceOf(z.ZodObject);
  expect(barSchema.shape.baz).toBeInstanceOf(z.ZodString);
  expect(barSchema.shape.quux).toBeInstanceOf(z.ZodBoolean);
});
