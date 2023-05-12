import {IColumnProps} from '@components';
import {IRenderable} from '@lib/renderer';
import {validator} from '@lib/validation';
import React from 'react';

import {IComponentProps} from './componentprops';

export interface IRenderConfiguration {
  components: IComponentConfiguration;
  containers: IContainerConfiguration;
  validators: validator[];
}

/**
 * Callback configuration is explicitly marked as optional in order to deal with different schemas
 * as third-party systems might need different callbacks.
 */
export interface ICallbackConfiguration {
  onBlur?: callback | undefined;
  onChange?: callback | undefined;
  onSubmit?: callback | undefined;
  [index: string]: callback | undefined;
}

export type callback = (e: Event | React.BaseSyntheticEvent) => void;

/**
 * Describes a mapping between a component type (`ComponentSchema.type`) and a (React) component to
 * render.
 * @example `{type: "textfield"}` -> <TextField/>
 */
export interface IComponentConfiguration {
  [index: string]: React.ComponentType<IColumnProps | IComponentProps>;
}

/**
 * Describes a mapping between an (internal) container type and a (React) component to render. The
 * internal container type is not directly linked to a specific key in `ComponentSchema` but may be
 * referenced directly by the renderer based specific conditions.
 * @example `{multiple: "true"}` -> <Multiple/>
 */
export interface IContainerConfiguration {
  [index: string]: React.ComponentType<IColumnProps | IComponentProps>;
}
