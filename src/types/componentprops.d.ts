import {ComponentSchema} from 'formiojs';
import React from 'react';

import {ICallbackConfiguration} from './config';
import {IFormioForm} from './form';
import {Value, Values} from './value';

export interface IComponentProps {
  callbacks: ICallbackConfiguration;
  component: ComponentSchema;
  errors: string[];
  form: IFormioForm;
  value: Value | Values | undefined;
  path: string;
  setValue: (field: string, value: any, shouldValidate?: boolean) => void;
  children?: React.ReactNode;
}
