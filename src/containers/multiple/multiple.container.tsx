import {Component, Description, Label} from '@components';
import {IRenderable, RenderComponent} from '@lib/renderer';
import {IComponentProps, Value, Values} from '@types';
import {ArrayHelpers, FieldArray} from 'formik';
import {ComponentSchema} from 'formiojs';
import React from 'react';

export interface IMultipleComponent extends ComponentSchema {
  key: string;
  type: string;
}

export interface IMultipleProps extends IComponentProps {
  component: IMultipleComponent;
  value: Values;
}

/**
 * Implements `multiple: true` behaviour.
 *
 * Provide a thin wrapper around a component with controls for adding multiple instances. Utilizes
 * <RenderComponent/> to render individual instances.
 */
export const Multiple: React.FC<IMultipleProps> = props => {
  const {component, form, path, value = []} = props; // FIXME: Awaits future pr.

  /** Renders individual components utilizing <RenderComponent/>. */
  const renderComponent = (value: Value, index: number, remove: ArrayHelpers['remove']) => {
    // Clone and adjust component to fit nested needs.
    const renderable: IRenderable = {
      ...structuredClone(component),
      key: `${path}.${index}`, // Trigger Formik array values.
      multiple: false, // Handled by <Multiple/>
      description: '', // One description rendered for all components.
      label: '', // One label rendered for all components.
    };

    return (
      <tr key={index}>
        <td>
          <RenderComponent
            component={renderable}
            form={form}
            path={`${path}.${index}`}
            value={value}
          />
        </td>
        <td>
          <button type="button" aria-controls={renderable.key} onClick={() => remove(index)}>
            Remove item
          </button>
        </td>
      </tr>
    );
  };

  return (
    <Component {...props}>
      {props.component.label && (
        <Label label={props.component.label} componentId={props.component.key as string} />
      )}
      <FieldArray
        name={component.key}
        render={({push, remove}) => (
          <table>
            <tbody>
              {value.map((value: Value, index: number) => renderComponent(value, index, remove))}
            </tbody>
            <tfoot>
              <tr>
                <td>
                  <button type="button" onClick={() => push(component.defaultValue || null)}>
                    Add another
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      />
      {props.component.description && <Description description={props.component.description} />}
    </Component>
  );
};
