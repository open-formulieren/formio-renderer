import type {AddressNLComponentSchema} from '@open-formulieren/types';
import type {AddressData} from '@open-formulieren/types/dist/components/addressNL';

import type {GetInitialValues} from '@/registry/types';
import type {JSONObject} from '@/types';

const getInitialValues: GetInitialValues<AddressNLComponentSchema, JSONObject> = ({
  key,
}: AddressNLComponentSchema) => {
  const defaultValue: AddressData = {
    postcode: '',
    houseNumber: '',
    houseLetter: '',
    houseNumberAddition: '',
    streetName: '',
    city: '',
    secretStreetCity: '',
    autoPopulated: false,
  } satisfies AddressData;
  // FIXME: the JSONValue generic type can't handle concrete interfaces
  return {[key]: defaultValue as unknown as JSONObject};
};

export default getInitialValues;
