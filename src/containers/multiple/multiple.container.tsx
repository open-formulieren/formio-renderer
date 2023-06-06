import {Component, Description, Label} from '@components';
import {IRenderable, RenderComponent} from '@lib/renderer';
import {IComponentProps, Values} from '@types';
import {ComponentSchema} from 'formiojs';
import React, {useState} from 'react';

export interface IMultipleComponent extends ComponentSchema {
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
  const {component, form, path, value = [], setValue} = props; // FIXME: Awaits future pr.
  const [keys, setKeys] = useState<number[]>([0]);

  /** Finds next key by increasing the max key with 1. */
  const getKey = (): number => {
    if (!keys.length) {
      return 0;
    }
    const max = Math.max(...keys);
    return max + 1;
  };

  /** Add item. */
  const add = () => {
    setKeys([...keys, getKey()]);
  };

  /** Remove item at index. */
  const remove = (index: number) => {
    const _keys = keys.filter((_, i) => i !== index);
    const val = value.filter((_, i) => i !== index);
    setKeys(_keys);
    setValue(path, val);
  };

  /** Renders individual components utilizing <RenderComponent/>. */
  const renderComponents = () =>
    keys.map((key, index) => {
      // Clone and adjust component to fit nested needs.
      const renderable: IRenderable = {
        ...structuredClone(component),
        key: `${path}.${index}`, // Trigger Formik array values.
        multiple: false, // Handled by <Multiple/>
        description: '', // One description rendered for all components.
        label: '', // One label rendered for all components.
      };

      return (
        <tr key={key}>
          <td>
            <RenderComponent component={renderable} form={form} path={path} value={value[index]} />
          </td>
          <td>
            <button onClick={() => remove(index)} aria-controls={renderable.key}>
              Remove item
            </button>
          </td>
        </tr>
      );
    });

  return (
    <Component {...props}>
      {props.component.label && (
        <Label label={props.component.label} componentId={props.component.key as string} />
      )}
      <table>
        <tbody>{renderComponents()}</tbody>
        <tfoot>
          <tr>
            <td>
              <button type="button" onClick={add}>
                Add another
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
      <table />
      {props.component.description && <Description description={props.component.description} />}
    </Component>
  );
};
