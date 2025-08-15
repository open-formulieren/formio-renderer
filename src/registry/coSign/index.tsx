import {FormattedMessage} from 'react-intl';

import type {CosignV1ComponentSchema} from '@open-formulieren/types';


import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ErrorMessage from '@/components/forms/ErrorMessage';

import ValueDisplay from './ValueDisplay';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';
import {useFormSettings} from '@/hooks';
import {useAsync} from 'react-use';
import LoadingIndicator from '@/components/LoadingIndicator';

// TODO-97: this callback probably needs to be passed to the FormioForm in the SDK, similar to
//  `addressAutoComplete` for addressNL
const getCosignStatus = async (baseUrl, submissionUuid) => {
  const endpoint = `${baseUrl}submissions/${submissionUuid}/co-sign`;
  return await get(endpoint);
};

// TODO-97: also this callback should be passed to the FormioForm. Then we do not have to worry
//  about submission context anymore, as this will be resolved already
const getLoginUrl = (...args) => {
  return 'asdf';
};

const CoSignAuthentication = ({form, submissionUuid, authPlugin}) => {
  // TODO-107: also the (modified) loginOptions can be passed to the FormioForm componentParameters
  const loginOption = form.loginOptions.find(opt => opt.identifier === authPlugin);
  // TODO-107: ErrorMessage might be replaceable with an `Alert`
  if (!loginOption) {
    return (
      <ErrorMessage>
        <FormattedMessage
          description="Co-sign auth option not available on form"
          defaultMessage="Something went wrong while presenting the login option. Please contact the municipality."
        />
      </ErrorMessage>
    );
  }

  // add the co-sign submission parameter to the login URL
  const loginUrl = getLoginUrl(loginOption, {coSignSubmission: submissionUuid});
  const modifiedLoginOption = {
    ...loginOption,
    url: loginUrl,
    label: (
      <FormattedMessage
        description="Login button label"
        defaultMessage="Login with {provider}"
        values={{provider: loginOption.label}}
      />
    ),
  };

  // TODO-107: probably we can get away with just a ButtonLink and some styling. No need to port
  //  all login options I think
  return (
    <LoginOptionsDisplay
      loginAsYourselfOptions={[modifiedLoginOption]}
      loginAsGemachtigdeOptions={[]}
    />
  );
};

export interface FormioCosignOldProps {
  componentDefinition: CosignV1ComponentSchema;
}

const FormioCosignOldField: React.FC<FormioCosignOldProps> = ({
  componentDefinition: {key, label, description, authPlugin = 'digid-mock'},
}) => {
  const formSettings = useFormSettings();

  const getCosignStatus = formSettings?.componentParameters?.coSign?.getCosignStatus;

  // TODO-107: what to do when getCosignStatus is undefined?
  const state = useAsync(async () => await getCosignStatus());
  // log errors to the console if any
  if (state.error) console.error(state.error);
  // while loading, display spinner
  if (state.loading) return <LoadingIndicator size="small" />;

  const {coSigned, representation} = state.value ?? {coSigned: false, representation: ''};
  // Early simple exit if it's cosigned already.
  if (coSigned) {
    return (
      // TODO-107: is this Body really necessary, or can we just use a div
      <Body component="div">
        <div className="openforms-co-sign__representation">
          {representation ?? (
            <FormattedMessage
              description="Co-signed without representation fallback message"
              defaultMessage="Something went wrong while processing the co-sign authentication. Please contact the municipality."
            />
          )}
        </div>
      </Body>
    );
  }

  // TODO-107: in the SDK, this prop seems to be used for displaying in the submission summary/overview. Not sure if it
  //  is still necessary, because it doesn't make much sense to use the whole component in the `ValueDisplay`...
  // not yet cosigned
  // if (!props.interactive) {
  //   return (
  //     <FormattedMessage
  //       description="Not co-signed (summary) message"
  //       defaultMessage="Not co-signed"
  //     />
  //   );
  // }

  const getLoginOption = formSettings?.componentParameters?.cosign?.getLoginOption;
  const loginOption = getLoginOption(authPlugin);

  if (!loginOption) {
    return (
      <ErrorMessage>
        <FormattedMessage
          description="Co-sign auth option not available on form"
          defaultMessage="Something went wrong while presenting the login option. Please contact the municipality."
        />
      </ErrorMessage>
    );
  }

  loginOption.label = (
    <FormattedMessage
      description="Login button label"
      defaultMessage="Login with {provider}"
      values={{provider: loginOption.label}}
    />
  );

  // TODO-107: probably we can get away with just a ButtonLink and some styling. No need to port
  //  all login options I think
  return (
    <LoginOptionsDisplay
      loginAsYourselfOptions={[modifiedLoginOption]}
      loginAsGemachtigdeOptions={[]}
    />
  );

};

const CosignOldComponent: RegistryEntry<CosignV1ComponentSchema> = {
  formField: FormioCosignOldField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
};

export default CosignOldComponent;
