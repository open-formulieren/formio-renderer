import {FieldConfigContext} from '@/context';
import type {FieldConfig} from '@/context';

const FieldConfigProvider: React.FC<React.PropsWithChildren<FieldConfig>> = ({
  children,
  ...props
}) => <FieldConfigContext.Provider value={props}>{children}</FieldConfigContext.Provider>;

export default FieldConfigProvider;
