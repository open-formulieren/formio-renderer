import type {AddressData, AddressNLComponentSchema} from '@open-formulieren/types';

import type {GetInitialValues} from '@/registry/types';
import type {JSONObject} from '@/types';

const getInitialValues: GetInitialValues<AddressNLComponentSchema, JSONObject> = ({
  key,
  defaultValue,
}: AddressNLComponentSchema) => {
  if (Array.isArray(defaultValue)) {
    throw new Error('There is no multiple: true support for addressNL components');
  }
  // if no default value is explicitly specified, return the empty value.
  if (defaultValue === undefined) {
    defaultValue = {
      postcode: '',
      houseNumber: '',
      houseLetter: '',
      houseNumberAddition: '',
      streetName: '',
      city: '',
      secretStreetCity: '',
      autoPopulated: false,
    } satisfies AddressData;
  }
  // FIXME: the JSONValue generic type can't handle concrete interfaces
  return {[key]: defaultValue as unknown as JSONObject};
};

export default getInitialValues;
