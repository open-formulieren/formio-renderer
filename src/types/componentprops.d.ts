import {ComponentSchema} from 'formiojs';
import React from 'react';

import {ICallbackConfiguration} from './config';
import {Value, Values} from './value';

interface IComponentProps {
  callbacks: ICallbackConfiguration;

  children?: React.ReactNode;

  component: ComponentSchema;

  errors: string[];

  value: Value | Values | undefined;
}
