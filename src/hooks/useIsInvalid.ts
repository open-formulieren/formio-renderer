import {useFormikContext} from 'formik';

const useIsInvalid = (name: string) => {
  const {getFieldMeta} = useFormikContext();
  const {error, touched} = getFieldMeta(name);
  return touched && !!error;
};

export default useIsInvalid;
