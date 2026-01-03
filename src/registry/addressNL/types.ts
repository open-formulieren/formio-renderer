import type {AddressData} from '@open-formulieren/types/dist/components/addressNL';

/**
 * A subset of the Formik state/values, scoped to the data belonging to the AddressNL
 * component.
 *
 * The string key index matches the `component.key` type, which *could* be a string with
 * periods, creating a nested object structure.
 */
export type FormValues = {
  [k: string]: AddressData | FormValues;
};

export interface AutoCompleteResponseBody {
  streetName: string;
  city: string;
  secretStreetCity: string;
}

export interface AddressNLParameters {
  addressAutoComplete: (
    postcode: string,
    houseNumber: string
  ) => Promise<AutoCompleteResponseBody | null>;
}
