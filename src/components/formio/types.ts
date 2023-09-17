export interface FormioRenderComponentProps<S> {
  component: S;
}

export type FormioComponentRenderer<T> = React.ComponentType<FormioRenderComponentProps<T>>;
